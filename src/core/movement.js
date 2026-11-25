export const directions = ["up", "right", "down", "left"];
const layouts = new WeakMap();

// Each entry is the adjacent cell or -1 at a wall or outer edge.
function neighbours(board) {
  if (layouts.has(board)) return layouts.get(board);
  const { size, walls } = board;
  const count = size * size;
  const steps = Array.from({ length: count }, (_, cell) => [
    cell >= size ? cell - size : -1,
    cell % size < size - 1 ? cell + 1 : -1,
    cell + size < count ? cell + size : -1,
    cell % size > 0 ? cell - 1 : -1,
  ]);
  for (const cell of board.blockedCells ?? []) {
    steps[cell].forEach((next, direction) => {
      if (next !== -1) steps[next][(direction + 2) % 4] = -1;
    });
    steps[cell].fill(-1);
  }
  for (const [a, b] of walls) {
    const forward = steps[a].indexOf(b);
    if (forward < 0) continue;
    steps[a][forward] = -1;
    steps[b][(forward + 2) % 4] = -1;
  }
  layouts.set(board, steps);
  return steps;
}

export function slide(board, positions, robot, direction) {
  const steps = neighbours(board);
  const d = directions.indexOf(direction);
  let cell = positions[robot];
  let next = steps[cell][d];
  while (next !== -1 && !positions.includes(next)) {
    cell = next;
    next = steps[cell][d];
  }
  return cell;
}
