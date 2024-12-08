import { test, expect, jest } from '@jest/globals';
import GameStateService from '../GameStateService';
import GamePlay from '../GamePlay';

jest.mock('../GamePlay');
beforeEach(() => jest.resetAllMocks());

test('If the `GameStateService` fails to load, an error should be thrown', () => {
  const gameStateService = new GameStateService(null);

  expect(
    () => gameStateService.load()
  ).toThrow('Invalid state');
});

test('If the `GameStateService` fails to load, an error message should be displayed', () => {
  const gameStateService = new GameStateService(null);
  const mockShowError = jest.fn(() => GamePlay.showError('Игру загрузить не удаётся :('));

  try {
    gameStateService.load();
  } catch (error) {
    mockShowError();
  }

  expect(mockShowError).toHaveBeenCalled();
});