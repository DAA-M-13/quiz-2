import { directions, slide } from "../core/movement.js";

export const budgets = {
  generation: { states: 900, ms: 100 },
  solution: { states: 20000, ms: 750 },
};

// One cursor can continue across UI slices and generation retries.
export function createSearch(board, positions, { goal, previous } = {}) {
  const initial = [...positions];
  const queue = [{ positions: initial, depth: 0, parent: -1 }];
  const key = (p) => ((p[0] * 256 + p[1]) * 256 + p[2]) * 256 + p[3];
  const seen = new Set([key(initial)]);
  const candidates = new Map();
  let head = 0;
  let status = "limited";
  let path = null;
  if (goal && initial[goal.target] === goal.dock) {
    status = "found";
    path = [];
  }

  function expand() {
    const parent = head++;
    const node = queue[parent];
    for (let robot = 0; robot < 4; robot++) {
      for (const direction of directions) {
        const end = slide(board, node.positions, robot, direction);
        if (end === node.positions[robot]) continue;
        const depth = node.depth + 1;
        if (goal && robot === goal.target && end === goal.dock) {
          path = [{ robot, direction }];
          for (let i = parent; queue[i].parent >= 0; i = queue[i].parent) {
            path.push(queue[i].move);
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
          if (!candidates.has(pair))
            candidates.set(pair, { target: robot, dock: end, minimum: depth });
        }
        const next = [...node.positions];
        next[robot] = end;
        const id = key(next);
        if (seen.has(id)) continue;
        seen.add(id);
        queue.push({
          positions: next,
          depth,
          parent,
          move: { robot, direction },
        });
      }
    }
    if (head === queue.length) status = "exhausted";
  }

  return {
    advance(states, ms) {
      const stop = performance.now() + ms;
      const last = head + states;
      while (status === "limited" && head < last && performance.now() < stop)
        expand();
      return { status, path, candidates, expanded: head };
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
