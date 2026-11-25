import test from "node:test";
import assert from "node:assert/strict";
import { exampleBoard as fixture } from "./fixtures/exampleBoard.js";
import { createSearch } from "../src/algorithms/iddfs.js";

test("IDDFS finds the shortest path and resumes across bounded advances", () => {
  const search = createSearch(fixture, fixture.positions, { goal: fixture });
  assert.equal(search.advance(1, Infinity).status, "limited");
  let result = search.advance(1, Infinity);
  while (result.status === "limited") {
    result = search.advance(1, Infinity);
  }
  assert.equal(result.status, "found");
  assert.deepEqual(result.path, [
    { robot: 1, direction: "down" },
    { robot: 0, direction: "right" },
  ]);
});

test("IDDFS recognizes a goal at the initial position and exhausts a stuck board", () => {
  assert.deepEqual(
    createSearch(fixture, fixture.positions, {
      goal: { target: 0, dock: fixture.positions[0] },
    }).advance(1, Infinity).path,
    [],
  );

  const board = {
    size: 2,
    walls: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ],
    positions: [0, 1, 2, 3],
    target: 0,
    dock: 3,
  };
  assert.equal(
    createSearch(board, board.positions, { goal: board }).advance(100, Infinity)
      .status,
    "exhausted",
  );
});
