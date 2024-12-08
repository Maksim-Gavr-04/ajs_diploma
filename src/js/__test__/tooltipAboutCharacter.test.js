import { test, expect } from '@jest/globals';
import tooltipAboutCharacter from '../tooltipAboutCharacter';
import Swordsman from '../Characters/Swordsman';
import PositionedCharacter from '../PositionedCharacter';

test('Testing the `tooltipAboutCharacter()` function', () => {
  const player = new Swordsman(1);
  player.health = 45;
  player.levelUp();
  const positionedCharacter = new PositionedCharacter(player, 28);

  const expected = '🎖2 ⚔50 🛡12 ❤100';
  expect(tooltipAboutCharacter(positionedCharacter.character)).toBe(expected);
});