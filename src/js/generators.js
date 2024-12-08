import Team from './Team';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до `maxLevel`
 * @param allowedTypes массив классов.
 * @param maxLevel максимальный возможный уровень персонажа.
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа,
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const index = Math.floor(Math.random() * allowedTypes.length);
    const type = allowedTypes[index];
    const level = Math.floor(Math.random() * maxLevel) + 1;

    yield new type(level);
  }
}

/**
 * Формирует массив персонажей на основе `characterGenerator`
 * @param allowedTypes массив классов.
 * @param maxLevel максимальный возможный уровень персонажа.
 * @param characterCount количество персонажей в команде, которое нужно сформировать.
 * @returns результат метода `toArray()` экземпляра `Team`, хранящего экземпляры персонажей.
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = new Team();
  const generator = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i++) {
    const character = generator.next().value;
    team.add(character);
  }

  return team.toArray();
}