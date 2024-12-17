/**
 * @todo
 * @param index индекс ячейки.
 * @param boardSize размер квадратного поля (в длину или ширину).
 * @returns `string` — тип ячейки на поле:
 * top-left,
 * top-right,
 * top,
 * bottom-left,
 * bottom-right,
 * bottom,
 * left,
 * right,
 * center
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 */
export function calcTileType(index, boardSize) {
  if (index === 0) return 'top-left';
  if (index === boardSize - 1) return 'top-right';
  if (index < boardSize - 1) return 'top';

  if (index === (boardSize - 1) * boardSize) return 'bottom-left';
  if (index === boardSize * boardSize - 1) return 'bottom-right';
  if (index > (boardSize - 1) * boardSize) return 'bottom';

  if (index % boardSize === 0) return 'left';
  if ((index + 1) % boardSize === 0) return 'right';

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) return 'critical';

  if (health < 50) return 'normal';

  return 'high';
}

/**
 * @param distance свойство класса персонажа `movementDistance` или `attackDistance`
 * @param cellIndex индекс ячейки с персонажем.
 * @param boardSize размер квадратного поля (в длину или ширину).
 * @returns массив индексов ячеек.
 */
export function calcCellIndexesForMovementOrAttack(distance, cellIndex, boardSize) {
  if (cellIndex >= boardSize ** 2) throw new Error('Unknown character cell index');

  const row = Math.trunc(cellIndex / boardSize);
  const column = cellIndex % boardSize;

  const result = [];
  for (let i = 1; i <= distance; i++) {
    const up = row - i;
    const down = row + i;
    const left = column - i;
    const right = column + i;
    // Вверх и вниз:
    if (up >= 0) result.push(up * 8 + column);
    if (down <= 7) result.push(down * 8 + column);
    // Влево и вправо:
    if (left >= 0) result.push(row * 8 + left);
    if (right <= 7) result.push(row * 8 + right);
    // Вверх-влево и вверх-вправо:
    if (up >= 0 && left >= 0) result.push(up * 8 + left);
    if (up >= 0 && right <= 7) result.push(up * 8 + right);
    // Вниз-влево и вниз-вправо:
    if (down <= 7 && left >= 0) result.push(down * 8 + left);
    if (down <= 7 && right <= 7) result.push(down * 8 + right);
  }

  return result;
}