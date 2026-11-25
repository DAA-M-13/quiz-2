import { createSearch, runSearch, budgets } from "../algorithms/bfs.js";

export function prepareRound(board, positions, number, previous) {
  const snapshot = {
    size: board.size,
    walls: board.walls,
    blockedCells: board.blockedCells ?? [],
    positions: [...positions],
    number,
  };
  const search = createSearch(board, positions, { previous });
  return async function generate(
    signal,
    budget = budgets.generation,
    random = Math.random,
  ) {
    const result = await runSearch(search, budget, signal);
    const pool = Array.from(result.candidates.values());
    const choice = pool[Math.floor(random() * pool.length)];
    return { ...result, round: choice ? { ...snapshot, ...choice } : null };
  };
}

const storageKey = "robot-seluncur.chapter.v1";
export function saveChapter(round) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(round));
  } catch {
    /* Storage may be unavailable. */
  }
}
export function loadChapter() {
  try {
    const r = JSON.parse(localStorage.getItem(storageKey));
    const cell = (n) => Number.isInteger(n) && n >= 0 && n < 256;
    if (
      r?.number === 1 &&
      r.size === 16 &&
      r.positions?.length === 4 &&
      r.positions.every(cell) &&
      new Set(r.positions).size === 4 &&
      cell(r.dock) &&
      Number.isInteger(r.target) &&
      r.target >= 0 &&
      r.target < 4 &&
      r.dock !== r.positions[r.target] &&
      Number.isInteger(r.minimum) &&
      r.minimum > 0 &&
      Array.isArray(r.walls) &&
      r.walls.every((w) => Array.isArray(w) && w.length === 2 && w.every(cell))
    )
      return r;
  } catch {
    /* A fresh chapter replaces invalid storage. */
  }
  return null;
}
