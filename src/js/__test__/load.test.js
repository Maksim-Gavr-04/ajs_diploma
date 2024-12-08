import { test, expect, jest } from '@jest/globals';
import GameStateService from '../GameStateService';

jest.mock('../GameStateService');
beforeEach(() => jest.resetAllMocks());

test('Testing the `GameStateService`', () => {
  const data = {
    level: 1,
    selectedCell: 8,
    pointsStatistics: [],
    playersTeam: [],
    opponentsTeam: [],
    positionsOfPlayersTeam: [],
    positionsOfOpponentsTeam: [],
  };

  const gameStateService = new GameStateService();
  gameStateService.load.mockReturnValue(data);

  expect(gameStateService.load()).toEqual(data);
});