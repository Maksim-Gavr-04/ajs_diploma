import PositionedCharacter from './PositionedCharacter';

const playersInitialCellIndexes = boardSize => {
  const result = [];
  for (let i = 0; i < boardSize ** 2; i += boardSize) {
    result.push(i);
    result.push(i + 1);
  }

  return result;
};

const opponentsInitialCellIndexes = boardSize => {
  const result = [];
  for (let i = boardSize - 1; i < boardSize ** 2; i += boardSize) {
    result.push(i);
    result.push(i - 1);
  }

  return result;
};

/**
 * @param team результат метода `toArray()` экземпляра `Team`
 * @param boardSize размер квадратного поля (в длину или ширину).
 * @param playerOrOpponent `string` — 'players' или 'opponents'
 * @returns массив объектов класса `PositionedCharacter`
 */
export default function teamPositioning(team, boardSize, playerOrOpponent) {
  const cellIndexes = [];
  if (playerOrOpponent === 'players') {
    cellIndexes.push(...playersInitialCellIndexes(boardSize));
  } else if (playerOrOpponent === 'opponents') {
    cellIndexes.push(...opponentsInitialCellIndexes(boardSize));
  } else {
    throw new Error('Parameter `playerOrOpponent` should be either the string `players` or `opponents`');
  }

  const result = [];
  team.forEach(member => {
    const idx = Math.floor(Math.random() * cellIndexes.length);
    result.push(new PositionedCharacter(member, cellIndexes[idx]));
    cellIndexes.splice(idx, 1);
  });

  return result;
}