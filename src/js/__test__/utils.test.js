import { test, expect } from '@jest/globals';
import { calcTileType, calcHealthLevel } from '../utils';

test.each([
  [ 0, 8, 'top-left' ],
  [ 1, 8, 'top' ],
  [ 6, 8, 'top' ],
  [ 7, 8, 'top-right' ],
  [ 8, 8, 'left' ],
  [ 15, 8, 'right' ],
  [ 25, 8, 'center' ],
  [ 48, 8, 'left' ],
  [ 55, 8, 'right' ],
  [ 56, 8, 'bottom-left' ],
  [ 57, 8, 'bottom' ],
  [ 62, 8, 'bottom' ],
  [ 63, 8, 'bottom-right' ]
])(('Testing the `calcTileType()` function'),
  (index, boardSize, expected) => {
    const result = calcTileType(index, boardSize);
    expect(result).toBe(expected);
  });

test.each([
  [ 14, 'critical' ],
  [ 16, 'normal' ],
  [ 49, 'normal' ],
  [ 51, 'high' ]
])(('Testing the `calcHealthLevel()` function'),
  (health, expected) => {
    const result = calcHealthLevel(health);
    expect(result).toBe(expected);
  });