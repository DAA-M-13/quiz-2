import test from "node:test";
import assert from "node:assert/strict";
import { createSearch as createBfsSearch } from "../src/algorithms/bfs.js";
import { createSearch as createAstarSearch } from "../src/algorithms/astar.js";
import { createSearch as createIddfsSearch } from "../src/algorithms/iddfs.js";
import { sampleTrace } from "../src/algorithms/searchTrace.js";
import { exampleBoard as fixture } from "./fixtures/exampleBoard.js";

test("BFS, A* and IDDFS report their expanded positions", () => {
  for (const createSearch of [
    createBfsSearch,
    createAstarSearch,
    createIddfsSearch,
  ]) {
    const result = createSearch(fixture, fixture.positions, {
      goal: fixture,
    }).advance(10000, Infinity);
    assert.equal(result.status, "found");
    assert.deepEqual(result.trace[0], fixture.positions);
    assert.equal(result.trace.length, result.expanded);
  }
});

test("search visualization samples at most 100 positions in visit order", () => {
  const trace = Array.from({ length: 205 }, (_, i) => [i]);
  const sampled = sampleTrace(trace);
  assert.equal(sampled.length, 100);
  assert.deepEqual(sampled[0], [0]);
  assert.deepEqual(sampled.at(-1), [204]);
  assert.ok(sampled.every((positions, i) => i === 0 || sampled[i - 1][0] < positions[0]));
});
