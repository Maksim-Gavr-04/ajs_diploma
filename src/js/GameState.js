export default class GameState {
  constructor() {
    this.level = 1;
    this.selectedCell = null;
    this.maxPoints = 0;
  }

  static from(object) {
    if (typeof object === 'object') {
      return object;
    }

    return null;
  }
}