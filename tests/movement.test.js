import assert from "node:assert/strict";
import test from "node:test";
import { createChapter } from "../src/core/chapterGenerator.js";
import { createSearch } from "../src/algorithms/bfs.js";
import { slide } from "../src/core/movement.js";
import { exampleBoard } from "./fixtures/exampleBoard.js";

test("Kotak tengah menutup empat petak untuk gerakan, posisi awal, dan dok BFS", () => {
  const chapter = createChapter(() => 0.47);
  assert.deepEqual(chapter.blockedCells, [119, 120, 135, 136]);
  assert.ok(chapter.positions.every(cell => !chapter.blockedCells.includes(cell)));
  const board = { ...chapter, walls: [] };
  for (const [start, direction, stop] of [
    [112, "right", 118], [128, "right", 134],
    [127, "left", 121], [143, "left", 137],
    [7, "down", 103], [8, "down", 104],
    [247, "up", 151], [248, "up", 152],
  ]) {
    assert.equal(slide(board, [start, 0, 1, 2], 0, direction), stop);
    assert.equal(slide(board, [stop, 0, 1, 2], 0, direction), stop);
  }
  const { candidates } = createSearch(chapter, chapter.positions).advance(900, Infinity);
  assert.ok(candidates.size > 0);
  for (const { dock } of candidates.values()) assert.ok(!chapter.blockedCells.includes(dock));
});

test("Hijau melintasi dok saat jalur kanan kosong", () => {
  assert.equal(slide(exampleBoard, exampleBoard.positions, 0, "right"), 15);
});

test("Dinding menghentikan biru, lalu biru menahan hijau di dok", () => {
  const positions = [...exampleBoard.positions];
  positions[1] = slide(exampleBoard, positions, 1, "down");
  assert.equal(positions[1], 12);
  assert.equal(slide(exampleBoard, positions, 0, "right"), exampleBoard.dock);
});

test("Dinding berlaku dua arah dan robot berhenti di batas papan", () => {
  const positions = [8, 20, 56, 63];
  assert.equal(slide(exampleBoard, positions, 1, "up"), 20);
  assert.equal(slide(exampleBoard, positions, 0, "left"), 8);
});
