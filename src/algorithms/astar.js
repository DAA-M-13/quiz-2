import { directions, slide } from "../core/movement.js";

export const budgets = {
  generation: { states: 900, ms: 100 },
  solution: { states: 20000, ms: 750 },
};

function createMinHeap() {
  const items = [];
  const compare = (a, b) => a.f - b.f || a.h - b.h;

  return {
    get size() {
      return items.length;
    },
    push(node) {
      let i = items.length;
      items.push(node);
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (compare(items[i], items[parent]) >= 0) break;
        [items[i], items[parent]] = [items[parent], items[i]];
        i = parent;
      }
    },
    pop() {
      if (!items.length) return null;
      const top = items[0];
      const last = items.pop();
      if (items.length) {
        items[0] = last;
        let i = 0;
        while (true) {
          let smallest = i;
          const left = (i << 1) + 1;
          const right = left + 1;
          if (left < items.length && compare(items[left], items[smallest]) < 0) {
            smallest = left;
          }
          if (right < items.length && compare(items[right], items[smallest]) < 0) {
            smallest = right;
          }
          if (smallest === i) break;
          [items[i], items[smallest]] = [items[smallest], items[i]];
          i = smallest;
        }
      }
      return top;
    },
  };
}

// One cursor can continue across UI slices and generation retries.
export function createSearch(board, positions, { goal, previous } = {}) {
  const initial = [...positions];
  const width = board.width ?? 16;
  const targetRow = goal ? Math.floor(goal.dock / width) : 0;
  const targetCol = goal ? goal.dock % width : 0;

  const heuristic = (pos) => {
    if (!goal) return 0;
    const robotPos = pos[goal.target];
    if (robotPos === goal.dock) return 0;
    const row = Math.floor(robotPos / width);
    const col = robotPos % width;
    return (row !== targetRow ? 1 : 0) + (col !== targetCol ? 1 : 0);
  };

  const key = (p) => ((p[0] * 256 + p[1]) * 256 + p[2]) * 256 + p[3];
  const bestG = new Map([[key(initial), 0]]);
  const candidates = new Map();
  const openSet = createMinHeap();

  const h0 = heuristic(initial);
  openSet.push({
    positions: initial,
    g: 0,
    h: h0,
    f: h0,
    parent: null,
    move: null,
  });

  let expanded = 0;
  let status = "limited";
  let path = null;

  if (goal && initial[goal.target] === goal.dock) {
    status = "found";
    path = [];
  }

  function expand() {
    const node = openSet.pop();
    if (!node) {
      status = "exhausted";
      return;
    }

    const currentBest = bestG.get(key(node.positions));
    if (currentBest !== undefined && node.g > currentBest) {
      if (openSet.size === 0) status = "exhausted";
      return;
    }

    expanded++;

    for (let robot = 0; robot < 4; robot++) {
      for (const direction of directions) {
        const end = slide(board, node.positions, robot, direction);
        if (end === node.positions[robot]) continue;

        const g = node.g + 1;

        if (goal && robot === goal.target && end === goal.dock) {
          path = [{ robot, direction }];
          for (let curr = node; curr.parent !== null; curr = curr.parent) {
            path.push(curr.move);
          }
          path.reverse();
          status = "found";
          return;
        }

        if (
          !goal &&
          end !== initial[robot] &&
          !(previous?.target === robot && previous.dock === end)
        ) {
          const pair = robot * 256 + end;
          const existing = candidates.get(pair);
          if (!existing || g < existing.minimum) {
            candidates.set(pair, { target: robot, dock: end, minimum: g });
          }
        }

        const next = [...node.positions];
        next[robot] = end;
        const id = key(next);
        const prevG = bestG.get(id);
        if (prevG !== undefined && g >= prevG) continue;

        bestG.set(id, g);
        const h = heuristic(next);
        openSet.push({
          positions: next,
          g,
          h,
          f: g + h,
          parent: node,
          move: { robot, direction },
        });
      }
    }

    if (status === "limited" && openSet.size === 0) {
      status = "exhausted";
    }
  }

  return {
    advance(states, ms) {
      const stop = performance.now() + ms;
      const last = expanded + states;
      while (status === "limited" && expanded < last && performance.now() < stop) {
        expand();
      }
      return { status, path, candidates, expanded };
    },
  };
}

export async function runSearch(search, budget, signal) {
  const started = performance.now();
  let result = search.advance(0, 0);
  const limit = result.expanded + budget.states;
  while (
    !signal?.aborted &&
    result.status === "limited" &&
    result.expanded < limit
  ) {
    const remaining = budget.ms - (performance.now() - started);
    if (remaining <= 0) break;
    result = search.advance(limit - result.expanded, Math.min(8, remaining));
    if (result.status === "limited" && result.expanded < limit) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  return { ...result, duration: performance.now() - started };
}