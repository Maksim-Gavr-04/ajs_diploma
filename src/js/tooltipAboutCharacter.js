export default function tooltipAboutCharacter(character) {
  const level = `\u{1F396}${character.level}`;
  const attack = `\u{2694}${character.attack}`;
  const defence = `\u{1F6E1}${character.defence}`;
  const health = `\u{2764}${character.health}`;

  return `${level} ${attack} ${defence} ${health}`;
}