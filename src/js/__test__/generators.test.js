import { test, expect } from '@jest/globals';
import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../Characters/Bowman';
import Swordsman from '../Characters/Swordsman';
import Magician from '../Characters/Magician';

test('Testing the `characterGenerator()` function', () => {
  const allowedTypes = [ Bowman, Swordsman, Magician ];
  const generator = characterGenerator(allowedTypes, 4);
  generator.next().value;
  generator.next().value;
  const value = generator.next().value;

  let isValueAnInstanceOfOneOfAllowedTypes = false;
  if (value instanceof Bowman || value instanceof Swordsman || value instanceof Magician) {
    isValueAnInstanceOfOneOfAllowedTypes = true;
  }

  expect(isValueAnInstanceOfOneOfAllowedTypes).toBe(true);
});

test('Testing the `generateTeam()` function', () => {
  const team = generateTeam([ Swordsman ], 2, 3);

  expect(team.length).toBe(3);

  let doesCharacterHaveRequiredLevel = false;
  if (
    (team[0].level === 1 || team[0].level === 2) &&
    (team[1].level === 1 || team[1].level === 2) &&
    (team[2].level === 1 || team[2].level === 2)
  ) {
    doesCharacterHaveRequiredLevel = true;
  }

  expect(doesCharacterHaveRequiredLevel).toBe(true);
});