import { test, expect } from '@jest/globals';
import Character from '../Character';
import Bowman from '../Characters/Bowman';
import Swordsman from '../Characters/Swordsman';
import Magician from '../Characters/Magician';
import Vampire from '../Characters/Vampire';
import Undead from '../Characters/Undead';
import Daemon from '../Characters/Daemon';

test('Testing the creation of instances of the `Character` class', () => {
  expect(
    () => new Character(5, 'bowman')
  ).toThrow('Creating instances of the `Character` class is prohibited');
});

test.each([
  [
    Bowman, {
      attack: 25, defence: 25, health: 100, movementDistance: 2, attackDistance: 2, level: 1, type: 'bowman'
    }
  ],
  [
    Swordsman, {
      attack: 40, defence: 10, health: 100, movementDistance: 4, attackDistance: 1, level: 1, type: 'swordsman'
    }
  ],
  [
    Magician, {
      attack: 10, defence: 40, health: 100, movementDistance: 1, attackDistance: 4, level: 1, type: 'magician'
    }
  ],
  [
    Vampire, {
      attack: 25, defence: 25, health: 100, movementDistance: 2, attackDistance: 2, level: 1, type: 'vampire'
    }
  ],
  [
    Undead, {
      attack: 40, defence: 10, health: 100, movementDistance: 4, attackDistance: 1, level: 1, type: 'undead'
    }
  ],
  [
    Daemon, {
      attack: 10, defence: 10, health: 100, movementDistance: 1, attackDistance: 4, level: 1, type: 'daemon'
    }
  ]
])(('Testing the creation of instances of inherited classes from `Character`'),
  (character, expected) => {
    expect(() => new character(1)).not.toThrow();
    expect(new character(1)).toEqual(expected);
  });