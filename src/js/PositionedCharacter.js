import Character from './Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('Character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('Position must be a number');
    }

    this.character = character;
    this.position = position;
  }
}