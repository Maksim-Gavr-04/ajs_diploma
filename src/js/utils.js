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
 * */
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