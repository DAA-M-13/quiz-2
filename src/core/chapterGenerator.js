export function createChapter(random = Math.random) {
  const size = 16;
  // Rows and columns 8–9 in the board's one-based coordinates.
  const topLeft = 7 * size + 7;
  const blockedCells = [topLeft, topLeft + 1, topLeft + size, topLeft + size + 1];
  const pick = (n) => Math.floor(random() * n);
  const walls = [];
  // Extend one or both arms of each L inside its sector, keeping passages between sectors open.
  for (let row = 0; row < size; row += 4) {
    for (let col = 0; col < size; col += 4) {
      const cell = (row + 1 + pick(2)) * size + col + 1 + pick(2);
      const dx = pick(2) ? 1 : -1;
      const dy = pick(2) ? size : -size;
      walls.push([cell, cell + dx], [cell, cell + dy]);
      const extension = pick(3);
      if (extension !== 0) walls.push([cell - dx, cell - dx + dy]);
      if (extension !== 1) walls.push([cell - dy, cell - dy + dx]);
    }
  }
  const cells = Array.from({ length: size * size }, (_, i) => i)
    .filter((cell) => !blockedCells.includes(cell));
  const positions = Array.from(
    { length: 4 },
    () => cells.splice(pick(cells.length), 1)[0],
  );
  return { size, walls, blockedCells, positions };
}
