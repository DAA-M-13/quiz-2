import { slide } from "./movement.js";

export function startRound(round) {
  return {
    round,
    positions: [...round.positions],
    facing: round.facing ? [...round.facing] : round.positions.map(() => "down"),
    active: round.target,
    history: [],
    won: false,
  };
}

export function applyMove(game, robot, direction) {
  if (game.won) return false;
  const end = slide(game.round, game.positions, robot, direction);
  if (end === game.positions[robot]) return false;
  game.history.push({ positions: [...game.positions], facing: [...game.facing] });
  game.positions[robot] = end;
  game.facing[robot] = direction;
  game.active = robot;
  game.won = game.positions[game.round.target] === game.round.dock;
  return true;
}

export function undo(game) {
  if (!game.history.length) return;
  const previous = game.history.pop();
  game.positions = previous.positions;
  game.facing = previous.facing;
  game.won = false;
}
