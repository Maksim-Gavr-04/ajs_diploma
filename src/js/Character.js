/**
 * Базовый класс, от которого наследуются классы персонажей.
 * @property `level` — уровень персонажа, от 1 до 4.
 * @property `attack` — показатель атаки.
 * @property `defence` — показатель защиты.
 * @property `health` — здоровье персонажа.
 * @property `type` — строка с одним из допустимых значений:
 * swordsman,
 * bowman,
 * magician,
 * vampire,
 * undead,
 * daemon.
 */
export default class Character {
  constructor(level) {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;

    if (new.target.name === 'Character') {
      throw new Error('Creating instances of the `Character` class is prohibited');
    }
  }

  levelUp() {
    this.level++;
    this.attack = Math.trunc(Math.max(this.attack, this.attack * (80 + this.health) / 100));
    this.defence = Math.trunc(Math.max(this.defence, this.defence * (80 + this.health) / 100));
    this.health += 80;
    if (this.health > 100) this.health = 100;
  }
}