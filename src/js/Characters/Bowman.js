import Character from '../Character';

export default class Bowman extends Character {
  constructor(level) {
    super(level);
    this.attack = 25;
    this.defence = 25;
    this.health = 100;
    this.movementDistance = 2;
    this.attackDistance = 2;
    this.type = 'bowman';
  }
}