import { calcCellIndexesForMovementOrAttack } from './utils';

export default class GameState {
  constructor(boardSize) {
    this.boardSize = boardSize;
    this.level = 1;
    this.selectedCell = null;
    this.maxPoints = 0;
    this.pointsStatistics = [];
    /** @property массив объектов класса `PositionedCharacter` */
    this.positionsOfPlayersTeam = [];
    /** @property массив объектов класса `PositionedCharacter` */
    this.positionsOfOpponentsTeam = [];
  }

  static from(object) {
    if (typeof object === 'object') {
      return object;
    }

    return null;
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
    if (this.selectedCell === null) return false;

    const character = this.characterOnCell(this.selectedCell).character;
    const cellsForMovement = calcCellIndexesForMovementOrAttack(character.movementDistance, this.selectedCell, this.boardSize);
    return cellsForMovement.includes(cellIndex);
  }

  isCellForAttack(cellIndex) {
    if (this.selectedCell === null) return false;

    const character = this.characterOnCell(this.selectedCell).character;
    const cellsForAttack = calcCellIndexesForMovementOrAttack(character.attackDistance, this.selectedCell, this.boardSize);
    return cellsForAttack.includes(cellIndex);
  }
}