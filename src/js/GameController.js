import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Vampire from './Characters/Vampire';
import Undead from './Characters/Undead';
import Daemon from './Characters/Daemon';

import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import teamPositioning from './teamPositioning';
import { generateTeam } from './generators';
import { calcCellIndexesForMovementOrAttack } from './utils';
import tooltipAboutCharacter from './tooltipAboutCharacter';
import cursors from './cursors';
import themes from './themes';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.gameState = new GameState(this.gamePlay.boardSize);
    this.stateService = stateService;

    this.isBoardBlocked = false;
    this.playersTypes = [ Bowman, Swordsman, Magician ];
    this.opponentsTypes = [ Vampire, Undead, Daemon ];

    this.playersTeam = generateTeam(this.playersTypes, 1, 2);
    this.opponentsTeam = generateTeam(this.opponentsTypes, 1, 2);

    this.gameState.positionsOfPlayersTeam = teamPositioning(this.playersTeam, this.gamePlay.boardSize, 'players');
    this.gameState.positionsOfOpponentsTeam = teamPositioning(this.opponentsTeam, this.gamePlay.boardSize, 'opponents');
  }

  init() {
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions([ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ]);

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onCellClick(cellIndex) {
    if (this.isBoardBlocked) return;

    if (this.gameState.selectedCell === null && this.gameState.isOpponent(cellIndex)) {
      GamePlay.showError('Вы не можете выбрать противника!');
    }

    if (this.gameState.characterOnCell(cellIndex) && this.gameState.isPlayer(cellIndex)) {
      if (this.gameState.selectedCell !== null) {
        this.gamePlay.deselectCell(this.gameState.selectedCell);
      }

      this.gamePlay.selectCell(cellIndex);
      this.gameState.selectedCell = cellIndex;
    }

    if (this.gameState.selectedCell === null) return;

    if (!this.gameState.isPlayer(cellIndex) && !this.gameState.isCellForMovement(cellIndex) && !this.gameState.isCellForAttack(cellIndex)) {
      GamePlay.showError('Недопустимый действие!');
    }
    else if (!this.gameState.characterOnCell(cellIndex) && !this.gameState.isCellForMovement(cellIndex) && this.gameState.isCellForAttack(cellIndex)) {
      GamePlay.showError('Недопустимый действие!');
    }
    else if (this.gameState.isOpponent(cellIndex) && this.gameState.isCellForMovement(cellIndex) && !this.gameState.isCellForAttack(cellIndex)) {
      GamePlay.showError('Недопустимый действие!');
    }

    if (!this.gameState.characterOnCell(cellIndex) && this.gameState.isCellForMovement(cellIndex)) {
      const player = [ ...this.gameState.positionsOfPlayersTeam ].find(
        player => player.position === this.gameState.selectedCell
      );
      player.position = cellIndex;

      this.gamePlay.deselectCell(this.gameState.selectedCell);
      this.gameState.selectedCell = cellIndex;
      this.gamePlay.selectCell(this.gameState.selectedCell);

      this.gamePlay.redrawPositions([ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ]);
      this.opponentAttackOrMovement();
    }

    if (this.gameState.isOpponent(cellIndex) && this.gameState.isCellForAttack(cellIndex)) {
      const attacker = this.gameState.characterOnCell(this.gameState.selectedCell).character;
      const target = this.gameState.characterOnCell(cellIndex).character;
      const damage = Math.trunc(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));

      (async () => {
        await this.gamePlay.showDamage(cellIndex, damage);
        const indexOfOpponent = [ ...this.gameState.positionsOfOpponentsTeam ].findIndex(
          opponent => opponent.position === cellIndex
        );
        const opponent = this.gameState.positionsOfOpponentsTeam[indexOfOpponent];
        opponent.character.health -= damage;

        if (opponent.character.health <= 0) {
          this.gamePlay.deselectCell(opponent.position);
          this.opponentsTeam.splice(indexOfOpponent, 1);
          this.gameState.positionsOfOpponentsTeam.splice(indexOfOpponent, 1);
        }

        this.gamePlay.redrawPositions([ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ]);
        this.opponentAttackOrMovement();
        this.completionLevelOrGame();
      })();
    }
  }

  onCellEnter(cellIndex) {
    if (this.isBoardBlocked) return;

    if (this.gameState.characterOnCell(cellIndex)) {
      this.gamePlay.setCursor(cursors.pointer);
      const tooltip = tooltipAboutCharacter(this.gameState.characterOnCell(cellIndex).character);
      this.gamePlay.showCellTooltip(tooltip, cellIndex);
    };

    if (this.gameState.selectedCell === null) return;

    if (!this.gameState.isPlayer(cellIndex) && !this.gameState.isCellForMovement(cellIndex) && !this.gameState.isCellForAttack(cellIndex)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    else if (!this.gameState.characterOnCell(cellIndex) && !this.gameState.isCellForMovement(cellIndex) && this.gameState.isCellForAttack(cellIndex)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    else if (this.gameState.isOpponent(cellIndex) && this.gameState.isCellForMovement(cellIndex) && !this.gameState.isCellForAttack(cellIndex)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    else if (!this.gameState.characterOnCell(cellIndex) && this.gameState.isCellForMovement(cellIndex)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(cellIndex, 'green');
    }
    else if (this.gameState.isOpponent(cellIndex) && this.gameState.isCellForAttack(cellIndex)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(cellIndex, 'red');
    }
  }

  onCellLeave(cellIndex) {
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.hideCellTooltip(cellIndex);
    if (cellIndex !== this.gameState.selectedCell) this.gamePlay.deselectCell(cellIndex);
  }

  onNewGameClick() {
    this.gameState.level = 1;
    this.gameState.selectedCell = null;
    this.isBoardBlocked = false;
    this.gameState.maxPoints = Math.max(...this.gameState.pointsStatistics) === -Infinity ?
      0 : Math.max(...this.gameState.pointsStatistics);

    this.gameState.pointsStatistics = [];
    this.playersTeam = generateTeam(this.playersTypes, 1, 2);
    this.opponentsTeam = generateTeam(this.opponentsTypes, 1, 2);

    this.gameState.positionsOfPlayersTeam = teamPositioning(this.playersTeam, this.gamePlay.boardSize, 'players');
    this.gameState.positionsOfOpponentsTeam = teamPositioning(this.opponentsTeam, this.gamePlay.boardSize, 'opponents');

    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions([ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ]);
    GamePlay.showMessage('Новая игра!');
  }

  onSaveGameClick() {
    if (this.isBoardBlocked) return;

    const data = {
      level: this.gameState.level,
      selectedCell: this.gameState.selectedCell,
      pointsStatistics: this.gameState.pointsStatistics,
      positionsOfPlayersTeam: this.gameState.positionsOfPlayersTeam,
      positionsOfOpponentsTeam: this.gameState.positionsOfOpponentsTeam,
    };

    this.stateService.save(GameState.from(data));
    GamePlay.showMessage('Игра успешно сохранена!');
  }

  onLoadGameClick() {
    this.isBoardBlocked = false;
    this.playersTeam = [];
    this.opponentsTeam = [];
    this.gameState.positionsOfPlayersTeam = [];
    this.gameState.positionsOfOpponentsTeam = [];

    try {
      const data = this.stateService.load();
      this.gameState.level = data.level;
      this.gameState.selectedCell = data.selectedCell;
      this.gameState.pointsStatistics = data.pointsStatistics;

      data.positionsOfPlayersTeam.forEach(player => {
        let character = null;

        if (player.character.type === 'bowman') {
          character = new Bowman(player.character.level);
          this.playersTeam.push(character);
        } else if (player.character.type === 'swordsman') {
          character = new Swordsman(player.character.level);
          this.playersTeam.push(character);
        } else if (player.character.type === 'magician') {
          character = new Magician(player.character.level);
          this.playersTeam.push(character);
        }

        character.attack = player.character.attack;
        character.defence = player.character.defence;
        character.health = player.character.health;
        this.gameState.positionsOfPlayersTeam.push(new PositionedCharacter(character, player.position));
      });

      data.positionsOfOpponentsTeam.forEach(opponent => {
        let character = null;

        if (opponent.character.type === 'vampire') {
          character = new Vampire(opponent.character.level);
          this.opponentsTeam.push(character);
        } else if (opponent.character.type === 'undead') {
          character = new Undead(opponent.character.level);
          this.opponentsTeam.push(character);
        } else if (opponent.character.type === 'daemon') {
          character = new Daemon(opponent.character.level);
          this.opponentsTeam.push(character);
        }

        character.attack = opponent.character.attack;
        character.defence = opponent.character.defence;
        character.health = opponent.character.health;
        this.gameState.positionsOfOpponentsTeam.push(new PositionedCharacter(character, opponent.position));
      });

      this.gamePlay.drawUi(themes[this.gameState.level]);
      this.gamePlay.redrawPositions([ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ]);
      if (this.gameState.selectedCell) this.gamePlay.selectCell(this.gameState.selectedCell);
      GamePlay.showMessage('Игра загружена!');
    } catch (error) {
      GamePlay.showMessage('Игру загрузить не удаётся :(');
      console.log(error);
    }
  }

  opponentAttackOrMovement(canOpponentMovement = true) {
    if (this.gameState.positionsOfPlayersTeam === 0 || this.gameState.positionsOfOpponentsTeam.length === 0) return;

    let attacker = null;
    let target = null;

    for (const opponent of [ ...this.gameState.positionsOfOpponentsTeam ]) {
      const cellIndexesForAttack = calcCellIndexesForMovementOrAttack(
        opponent.character.attackDistance, opponent.position, this.gamePlay.boardSize
      );
      [ ...this.gameState.positionsOfPlayersTeam ].forEach(player => {
        if (!cellIndexesForAttack.includes(player.position)) return;

        attacker = opponent;
        target = player;
      });
    }

    const positionsOfTeams = [ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ];

    if (!target && canOpponentMovement) {
      const indexOfOpponent = Math.floor(Math.random() * [ ...this.gameState.positionsOfOpponentsTeam ].length);
      attacker = [ ...this.gameState.positionsOfOpponentsTeam ][indexOfOpponent];

      const cellIndexesForMovement = calcCellIndexesForMovementOrAttack(
        attacker.character.movementDistance, attacker.position, this.gamePlay.boardSize
      );
      for (const cellIndex of [ ...cellIndexesForMovement ]) {
        positionsOfTeams.forEach(instance => {
          if (cellIndex !== instance.position) return;

          cellIndexesForMovement.splice(cellIndexesForMovement.indexOf(instance.position), 1);
        });
      }

      this.gamePlay.deselectCell(attacker.position);
      const cellIndexForMovement = cellIndexesForMovement[Math.floor(Math.random() * [ ...cellIndexesForMovement ].length)];
      this.gameState.positionsOfOpponentsTeam[indexOfOpponent].position = cellIndexForMovement;

      this.gamePlay.redrawPositions([ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ]);
    } else if (target) {
      const damage = Math.trunc(Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1));

      (async () => {
        await this.gamePlay.showDamage(target.position, damage);
        target.character.health -= damage;

        if (target.character.health <= 0) {
          if (target.position === this.gameState.selectedCell) {
            this.gamePlay.deselectCell(attacker.position);
            this.gamePlay.deselectCell(this.gameState.selectedCell);
            this.gameState.selectedCell = null;
          }

          this.playersTeam.splice(this.playersTeam.indexOf(target.character), 1);
          this.gameState.positionsOfPlayersTeam.splice(this.gameState.positionsOfPlayersTeam.indexOf(target), 1);
        }

        this.gamePlay.redrawPositions([ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ]);
        this.completionLevelOrGame();
      })();
    }
  }

  completionLevelOrGame() {
    if (this.gameState.positionsOfOpponentsTeam.length === 0) {
      this.gamePlay.deselectCell(this.gameState.selectedCell);
      this.gameState.selectedCell = null;

      const points = this.gameState.pointsForCompletedLevel();
      this.gameState.pointsStatistics.push(points);

      if (this.gameState.level < 4) {
        this.gameState.level++;
        this.playersTeam.forEach(member => member.levelUp());
        const remainingPlayersTeam = [ ...this.playersTeam ];

        this.playersTeam = [ ...generateTeam(this.playersTypes, this.gameState.level, 1), ...remainingPlayersTeam ];
        this.opponentsTeam = generateTeam(this.opponentsTypes, this.gameState.level, this.playersTeam.length);

        this.gameState.positionsOfPlayersTeam = teamPositioning(this.playersTeam, this.gamePlay.boardSize, 'players');
        this.gameState.positionsOfOpponentsTeam = teamPositioning(this.opponentsTeam, this.gamePlay.boardSize, 'opponents');

        this.gamePlay.drawUi(themes[this.gameState.level]);
        this.gamePlay.redrawPositions([ ...this.gameState.positionsOfPlayersTeam, ...this.gameState.positionsOfOpponentsTeam ]);
        GamePlay.showMessage(
          `Новый ${this.gameState.level} уровень игры!\n` +
          `Количество баллов за пройденный ${this.gameState.level - 1} уровень: ${points}`
        );
      } else if (this.gameState.level === 4) {
        this.isBoardBlocked = true;
        GamePlay.showMessage(
          'ПОБЕДА!\n' +
          `Количество баллов за пройденный ${this.gameState.level} уровень: ${points}\n` +
          `Максимальное количество баллов: ${Math.max(...this.gameState.pointsStatistics)}\n` +
          `Итоговое количество баллов: ${this.gameState.pointsStatistics.reduce((acc, value) => acc + value, 0)}`
        );
      }
    } else if (this.gameState.positionsOfPlayersTeam.length === 0) {
      this.isBoardBlocked = true;
      const maxPoints = Math.max(...this.gameState.pointsStatistics) === -Infinity ?
        0 : Math.max(...this.gameState.pointsStatistics);
      GamePlay.showMessage(
        'ПОРАЖЕНИЕ!\n' +
        `Максимальное количество баллов: ${maxPoints}\n` +
        `Итоговое количество баллов: ${this.gameState.pointsStatistics.reduce((acc, value) => acc + value, 0)}`
      );
    }
  }
}