/**
 * Класс, представляющий персонажей команды.
 * @todo Самостоятельно продумайте хранение персонажей в классе.
 * */
export default class Team {
  constructor() {
    this.members = new Set();
  }

  add(character) {
    this.members.add(character);
  }

  toArray() {
    return [ ...this.members ];
  }
}