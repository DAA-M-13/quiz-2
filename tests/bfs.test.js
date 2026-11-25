import test from "node:test";
import assert from "node:assert/strict";
import { exampleBoard as fixture } from "./fixtures/exampleBoard.js";
import { createSearch } from "../src/algorithms/bfs.js";
import { startRound, applyMove, undo } from "../src/core/gameState.js";
import { prepareRound } from "../src/core/roundManager.js";

test("U-02, U-04, U-08, U-14: blocked input, limited search and two-move optimum", () => {
  const game = startRound(fixture);
  const before = structuredClone(game);
  assert.equal(applyMove(game, 0, "left"), false);
  assert.deepEqual(game, before);
  const search = createSearch(fixture, game.positions, { goal: fixture });
  assert.equal(search.advance(1, Infinity).status, "limited");
  const { path } = search.advance(100, Infinity);
  assert.deepEqual(path, [
    { robot: 1, direction: "down" },
    { robot: 0, direction: "right" },
  ]);
  assert.deepEqual(game, before);
  path.forEach((m) => applyMove(game, m.robot, m.direction));
  assert.ok(game.won);
  undo(game);
  assert.equal(game.history.length, 1);
  assert.deepEqual(game.positions, [8, 12, 56, 63]);
});

test("U-03: crossing the dock or parking another robot on it keeps play active", () => {
  const game = startRound(fixture);
  applyMove(game, 0, "right");
  assert.equal(game.won, false);
  const other = startRound({ ...fixture, dock: 12 });
  applyMove(other, 1, "down");
  assert.equal(other.positions[1], 12);
  assert.equal(other.won, false);
});

test("U-15: enclosed target exhausts the queue", () => {
  const board = {
    size: 3,
    walls: [
      [4, 1],
      [4, 3],
      [4, 5],
      [4, 7],
    ],
    positions: [4, 0, 1, 2],
    target: 0,
    dock: 8,
  };
  assert.equal(
    createSearch(board, board.positions, { goal: board }).advance(
      10000,
      Infinity,
    ).status,
    "exhausted",
  );
});

test("U-17: generation resumes from the same snapshot after a zero budget", async () => {
  const generate = prepareRound(fixture, fixture.positions, 2, fixture);
  assert.equal((await generate(null, { states: 0, ms: 100 })).round, null);
  const { round } = await generate(null, { states: 10, ms: 100 });
  assert.deepEqual(round.positions, fixture.positions);
  assert.deepEqual(round.walls, fixture.walls);
  assert.ok(round.target !== fixture.target || round.dock !== fixture.dock);
});
