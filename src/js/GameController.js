import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Vampire from './Characters/Vampire';
import Undead from './Characters/Undead';
import Daemon from './Characters/Daemon';

import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import cursors from './cursors';
import themes from './themes';
import tooltipAboutCharacter from './tooltipAboutCharacter';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.gameState = new GameState();
    this.stateService = stateService;

    this.isBoardBlocked = false;
    this.pointsStatistics = [];
    this.playersTypes = [ Bowman ];
    this.opponentsTypes = [ Bowman ];

    this.playersTeam = generateTeam(this.playersTypes, 1, 2);
    this.opponentsTeam = generateTeam(this.opponentsTypes, 1, 2);

    /** @property массив объектов класса `PositionedCharacter` */
    this.positionsOfPlayersTeam = this.teamPositioning(this.playersTeam, this.playersInitialCellIndexes());
    /** @property массив объектов класса `PositionedCharacter` */
    this.positionsOfOpponentsTeam = this.teamPositioning(this.opponentsTeam, this.opponentsInitialCellIndexes());
  }

  init() {
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions([ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ]);

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onCellClick(cellIndex) {
    if (this.isBoardBlocked) return;

    if (this.gameState.selectedCell === null && this.isOpponent(cellIndex)) {
      GamePlay.showError('Вы не можете выбрать противника!');
    }

    if (this.characterOnCell(cellIndex) && this.isPlayer(cellIndex)) {
      if (this.gameState.selectedCell !== null) {
        this.gamePlay.deselectCell(this.gameState.selectedCell);
      }

      this.gamePlay.selectCell(cellIndex);
      this.gameState.selectedCell = cellIndex;
    }

    if (this.gameState.selectedCell === null) return;

    if (!this.isPlayer(cellIndex) && !this.isCellForMovement(cellIndex) && !this.isCellForAttack(cellIndex)) {
      GamePlay.showError('Недопустимый действие!');
    }

    if (!this.characterOnCell(cellIndex) && !this.isCellForMovement(cellIndex) && this.isCellForAttack(cellIndex)) {
      GamePlay.showError('Недопустимый действие!');
    }

    if (this.isOpponent(cellIndex) && this.isCellForMovement(cellIndex) && !this.isCellForAttack(cellIndex)) {
      GamePlay.showError('Недопустимый действие!');
    }

    if (!this.characterOnCell(cellIndex) && this.isCellForMovement(cellIndex)) {
      const player = [ ...this.positionsOfPlayersTeam ].find(
        player => player.position === this.gameState.selectedCell
      );
      player.position = cellIndex;

      this.gamePlay.deselectCell(this.gameState.selectedCell);
      this.gameState.selectedCell = cellIndex;
      this.gamePlay.selectCell(this.gameState.selectedCell);

      this.gamePlay.redrawPositions([ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ]);
      this.opponentAttackOrMovement();
    }

    if (this.isOpponent(cellIndex) && this.isCellForAttack(cellIndex)) {
      const attacker = this.characterOnCell(this.gameState.selectedCell).character;
      const target = this.characterOnCell(cellIndex).character;
      const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);

      (async () => {
        await this.gamePlay.showDamage(cellIndex, damage);

        const indexOfOpponent = [ ...this.positionsOfOpponentsTeam ].findIndex(
          opponent => opponent.position === cellIndex
        );
        const opponent = this.positionsOfOpponentsTeam[indexOfOpponent];
        opponent.character.health -= damage;

        if (opponent.character.health <= 0) {
          this.gamePlay.deselectCell(opponent.position);
          this.opponentsTeam.splice(indexOfOpponent, 1);
          this.positionsOfOpponentsTeam.splice(indexOfOpponent, 1);
        }

        this.gamePlay.redrawPositions([ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ]);
        this.opponentAttackOrMovement();
        this.completionLevelOrGame();
      })();
    }
  }

  onCellEnter(cellIndex) {
    if (this.isBoardBlocked) return;

    if (this.characterOnCell(cellIndex)) {
      this.gamePlay.setCursor(cursors.pointer);
      const tooltip = tooltipAboutCharacter(this.characterOnCell(cellIndex).character);
      this.gamePlay.showCellTooltip(tooltip, cellIndex);
    };

    if (this.gameState.selectedCell === null) return;

    if (!this.isPlayer(cellIndex) && !this.isCellForMovement(cellIndex) && !this.isCellForAttack(cellIndex)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    else if (!this.characterOnCell(cellIndex) && !this.isCellForMovement(cellIndex) && this.isCellForAttack(cellIndex)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    else if (this.isOpponent(cellIndex) && this.isCellForMovement(cellIndex) && !this.isCellForAttack(cellIndex)) {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    else if (!this.characterOnCell(cellIndex) && this.isCellForMovement(cellIndex)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(cellIndex, 'green');
    }
    else if (this.isOpponent(cellIndex) && this.isCellForAttack(cellIndex)) {
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
    this.gameState.maxPoints = Math.max(...this.pointsStatistics) === -Infinity ? 0 : Math.max(...this.pointsStatistics);
    this.pointsStatistics = [];

    this.playersTeam = generateTeam(this.playersTypes, 1, 2);
    this.opponentsTeam = generateTeam(this.opponentsTypes, 1, 2);
    this.positionsOfPlayersTeam = this.teamPositioning(this.playersTeam, this.playersInitialCellIndexes());
    this.positionsOfOpponentsTeam = this.teamPositioning(this.opponentsTeam, this.opponentsInitialCellIndexes());

    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions([ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ]);
    GamePlay.showMessage('Новая игра!');
  }

  onSaveGameClick() {
    if (this.isBoardBlocked) return;

    const data = {
      level: this.gameState.level,
      selectedCell: this.gameState.selectedCell,
      pointsStatistics: this.pointsStatistics,
      playersTeam: this.playersTeam,
      opponentsTeam: this.opponentsTeam,
      positionsOfPlayersTeam: this.positionsOfPlayersTeam,
      positionsOfOpponentsTeam: this.positionsOfOpponentsTeam,
    };

    this.stateService.save(GameState.from(data));
    GamePlay.showMessage('Игра успешно сохранена!');
  }

  onLoadGameClick() {
    this.isBoardBlocked = false;
    this.playersTeam = [];
    this.opponentsTeam = [];
    this.positionsOfPlayersTeam = [];
    this.positionsOfOpponentsTeam = [];

    try {
      const data = this.stateService.load();
      this.gameState.level = data.level;
      this.gameState.selectedCell = data.selectedCell;
      this.pointsStatistics = data.pointsStatistics;

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
        this.positionsOfPlayersTeam.push(new PositionedCharacter(character, player.position));
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
        } else if (opponent.character.type === 'bowman') {
          character = new Bowman(opponent.character.level);
          this.opponentsTeam.push(character);
        }

        character.attack = opponent.character.attack;
        character.defence = opponent.character.defence;
        character.health = opponent.character.health;
        this.positionsOfOpponentsTeam.push(new PositionedCharacter(character, opponent.position));
      });

      this.gamePlay.drawUi(themes[this.gameState.level]);
      this.gamePlay.redrawPositions([ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ]);
      this.gamePlay.selectCell(this.gameState.selectedCell);
      GamePlay.showMessage('Игра загружена!');
    } catch (error) {
      GamePlay.showMessage('Игру загрузить не удаётся :(');
      console.log(error);
    }
  }

  opponentAttackOrMovement(canOpponentMovement = true) {
    if (this.positionsOfPlayersTeam === 0 || this.positionsOfOpponentsTeam.length === 0) return;

    let attacker = null;
    let target = null;

    for (const opponent of [ ...this.positionsOfOpponentsTeam ]) {
      const cellIndexesForAttack = this.distanceCalculation(opponent.character.attackDistance, opponent.position);

      [ ...this.positionsOfPlayersTeam ].forEach(player => {
        if (!cellIndexesForAttack.includes(player.position)) return;

        attacker = opponent;
        target = player;
      });
    }

    const positionsOfTeams = [ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ];

    if (!target && canOpponentMovement) {
      // Перемещение:
      const indexOfOpponent = Math.floor(Math.random() * [ ...this.positionsOfOpponentsTeam ].length);
      attacker = [ ...this.positionsOfOpponentsTeam ][ indexOfOpponent ];

      const cellIndexesForMovement = this.distanceCalculation(attacker.character.movementDistance, attacker.position);
      for (const cell of cellIndexesForMovement) {
        positionsOfTeams.forEach(instance => {
          if (cell !== instance.position) return;
          cellIndexesForMovement.splice(cellIndexesForMovement.indexOf(instance.position), 1);
        });
      }

      this.gamePlay.deselectCell(attacker.position);
      const cellForMovement = cellIndexesForMovement[ Math.floor(Math.random() * cellIndexesForMovement.length) ];
      this.positionsOfOpponentsTeam[indexOfOpponent].position = cellForMovement;

      this.gamePlay.redrawPositions([ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ]);
    } else if (target) {
      // Атака:
      const damage = Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1);

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
          this.positionsOfPlayersTeam.splice(this.positionsOfPlayersTeam.indexOf(target), 1);
        }

        this.gamePlay.redrawPositions([ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ]);
        this.completionLevelOrGame();
      })();
    }
  }

  completionLevelOrGame() {
    if (this.positionsOfOpponentsTeam.length === 0) {
      this.gamePlay.deselectCell(this.gameState.selectedCell);
      this.gameState.selectedCell = null;

      const points = this.pointsForCompletedLevel();
      this.pointsStatistics.push(points);

      if (this.gameState.level < 4) {
        this.gameState.level++;
        this.playersTeam.forEach(member => member.levelUp());
        const remainingPlayersTeam = [ ...this.playersTeam ];

        this.playersTeam = [ ...generateTeam(this.playersTypes, this.gameState.level, 1), ...remainingPlayersTeam ];
        this.opponentsTeam = generateTeam(this.opponentsTypes, this.gameState.level, this.playersTeam.length);

        this.positionsOfPlayersTeam = this.teamPositioning(this.playersTeam, this.playersInitialCellIndexes());
        this.positionsOfOpponentsTeam = this.teamPositioning(this.opponentsTeam, this.opponentsInitialCellIndexes());

        this.gamePlay.drawUi(themes[this.gameState.level]);
        this.gamePlay.redrawPositions([ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ]);
        GamePlay.showMessage(
          `Новый ${this.gameState.level} уровень игры!\n` +
          `Количество баллов за пройденный ${this.gameState.level - 1} уровень: ${points}`
        );
      } else if (this.gameState.level === 4) {
        this.isBoardBlocked = true;
        GamePlay.showMessage(
          'ПОБЕДА!\n' +
          `Количество баллов за пройденный ${this.gameState.level} уровень: ${points}\n` +
          `Максимальное количество баллов: ${Math.max(...this.pointsStatistics)}\n` +
          `Итоговое количество баллов: ${this.pointsStatistics.reduce((acc, value) => acc + value, 0)}`
        );
      }
    } else if (this.positionsOfPlayersTeam.length === 0) {
      this.isBoardBlocked = true;
      const maxPoints = Math.max(...this.pointsStatistics) === -Infinity ? 0 : Math.max(...this.pointsStatistics);
      GamePlay.showMessage(
        'ПОРАЖЕНИЕ!\n' +
        `Максимальное количество баллов: ${maxPoints}\n` +
        `Итоговое количество баллов: ${this.pointsStatistics.reduce((acc, value) => acc + value, 0)}`
      );
    }
  }

  pointsForCompletedLevel() {
    return this.positionsOfPlayersTeam.reduce((acc, player) => acc + player.character.health, 0);
  }

  characterOnCell(cellIndex) {
    const positionsOfTeams = [ ...this.positionsOfPlayersTeam, ...this.positionsOfOpponentsTeam ];
    return positionsOfTeams.find(instance => instance.position === cellIndex);
  }

  isPlayer(cellIndex) {
    return [ ...this.positionsOfPlayersTeam ].some(player => player.position === cellIndex);
  }

  isOpponent(cellIndex) {
    return [ ...this.positionsOfOpponentsTeam ].some(opponent => opponent.position === cellIndex);
  }

  isCellForMovement(cellIndex) {
    if (this.gameState.selectedCell === null) return false;

    const character = this.characterOnCell(this.gameState.selectedCell).character;
    const cellsForMovement = this.distanceCalculation(character.movementDistance, this.gameState.selectedCell);
    return cellsForMovement.includes(cellIndex);
  }

  isCellForAttack(cellIndex) {
    if (this.gameState.selectedCell === null) return false;

    const character = this.characterOnCell(this.gameState.selectedCell).character;
    const cellsForAttack = this.distanceCalculation(character.attackDistance, this.gameState.selectedCell);
    return cellsForAttack.includes(cellIndex);
  }

  playersInitialCellIndexes() {
    const result = [];
    const boardSize = this.gamePlay.boardSize;
    for (let i = 0; i < boardSize ** 2; i += boardSize) {
      result.push(i);
      result.push(i + 1);
    }

    return result;
  }

  opponentsInitialCellIndexes() {
    const result = [];
    const boardSize = this.gamePlay.boardSize;
    for (let i = boardSize - 1; i < boardSize ** 2; i += boardSize) {
      result.push(i);
      result.push(i - 1);
    }

    return result;
  }

  /**
   * @param team результат метода `toArray()` экземпляра `Team`
   * @param cellIndexes результат метода `playersInitialCellIndexes()` или `opponentsInitialCellIndexes()`
   * @returns массив объектов класса `PositionedCharacter`
   */
  teamPositioning(team, cellIndexes) {
    const copy = [ ...cellIndexes ];
    const result = [];
    team.forEach(member => {
      const copyIndex = Math.floor(Math.random() * copy.length);
      result.push(new PositionedCharacter(member, copy[copyIndex]));
      copy.splice(copyIndex, 1);
    });

    return result;
  }

  /**
   * @param distance свойство класса персонажа `movementDistance` или `attackDistance`
   * @param cellIndex индекс ячейки с персонажем.
   * @returns массив индексов ячеек.
   */
  distanceCalculation(distance, cellIndex) {
    const boardSize = this.gamePlay.boardSize;
    if (cellIndex >= boardSize ** 2) throw new Error('Unknown character cell index');

    const row = Math.trunc(cellIndex / boardSize);
    const column = cellIndex % boardSize;

    const result = [];
    for (let i = 1; i <= distance; i++) {
      const up = row - i;
      const down = row + i;
      const left = column - i;
      const right = column + i;
      // Вверх и вниз:
      if (up >= 0) result.push(up * 8 + column);
      if (down <= 7) result.push(down * 8 + column);
      // Влево и вправо:
      if (left >= 0) result.push(row * 8 + left);
      if (right <= 7) result.push(row * 8 + right);
      // Вверх-влево и вверх-вправо:
      if (up >= 0 && left >= 0) result.push(up * 8 + left);
      if (up >= 0 && right <= 7) result.push(up * 8 + right);
      // Вниз-влево и вниз-вправо:
      if (down <= 7 && left >= 0) result.push(down * 8 + left);
      if (down <= 7 && right <= 7) result.push(down * 8 + right);
    }

    return result;
  }
}