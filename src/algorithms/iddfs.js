import { directions, slide } from "../core/movement.js";

export function createSearch(board, positions, { goal, previous } = {}) {
  const initial = [...positions];
  const key = (p) => ((p[0] * 256 + p[1]) * 256 + p[2]) * 256 + p[3];
  const candidates = new Map();
  const fullyExpanded = new Set();
  const onPath = new Set([key(initial)]);
  let depthLimit = 0;
  let expanded = 0;
  let stack = [];
  let path = null;
  let status = "limited";
  let hasFrontier = false;

  function startIteration() {
    const rootKey = key(initial);
    stack = [
      {
        positions: initial,
        depth: 0,
        move: null,
        nextMove: 0,
        entered: false,
        key: rootKey,
      },
    ];
    hasFrontier = false;
  }

  if (goal && initial[goal.target] === goal.dock) {
    status = "found";
    path = [];
  } else {
    startIteration();
  }

  function popFrame() {
    const frame = stack.pop();
    if (frame.depth > 0) onPath.delete(frame.key);
  }

  function step() {
    const frame = stack.at(-1);
    if (!frame) {
      if (!hasFrontier) {
        status = "exhausted";
        return;
      }
      depthLimit++;
      startIteration();
      return;
    }

    if (!frame.entered) {
      frame.entered = true;
      expanded++;
      if (frame.depth === depthLimit) {
        for (let robot = 0; robot < 4; robot++) {
          for (const direction of directions) {
            const end = slide(board, frame.positions, robot, direction);
            if (end === frame.positions[robot]) continue;
            const next = [...frame.positions];
            next[robot] = end;
            if (!fullyExpanded.has(key(next))) hasFrontier = true;
          }
        }
        fullyExpanded.add(frame.key);
        popFrame();
      }
      return;
    }

    while (frame.nextMove < 16) {
      const moveIndex = frame.nextMove++;
      const robot = Math.floor(moveIndex / 4);
      const direction = directions[moveIndex % 4];
      const end = slide(board, frame.positions, robot, direction);
      if (end === frame.positions[robot]) continue;

      const move = { robot, direction };
      if (goal && robot === goal.target && end === goal.dock) {
        path = stack.slice(1).map((node) => node.move);
        path.push(move);
        status = "found";
        return;
      }

      if (
        !goal &&
        end !== initial[robot] &&
        !(previous?.target === robot && previous.dock === end)
      ) {
        const pair = robot * 256 + end;
        if (!candidates.has(pair)) {
          candidates.set(pair, { target: robot, dock: end, minimum: frame.depth + 1 });
        }
      }

      const next = [...frame.positions];
      next[robot] = end;
      const nextKey = key(next);
      if (onPath.has(nextKey)) continue;
      onPath.add(nextKey);
      stack.push({
        positions: next,
        depth: frame.depth + 1,
        move,
        nextMove: 0,
        entered: false,
        key: nextKey,
      });
      return;
    }

    fullyExpanded.add(frame.key);
    popFrame();
  }

  return {
    advance(states, ms) {
      const stop = performance.now() + ms;
      const last = expanded + states;
      while (status === "limited" && expanded < last && performance.now() < stop) {
        step();
      }
      return { status, path, candidates, expanded };
    },
  };
}
