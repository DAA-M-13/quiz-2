import { budgets, createSearch, runSearch } from "./algorithms/bfs.js";
import { createChapter } from "./core/chapterGenerator.js";
import { applyMove, startRound, undo } from "./core/gameState.js";
import { loadChapter, prepareRound, saveChapter } from "./core/roundManager.js";
import { slide } from "./core/movement.js";
import { bindKeyboard } from "./input/keyboard.js";
import { createBoardView, robots } from "./ui/renderBoard.js";
import { showConfetti } from "./ui/confetti.js";

const byId = (id) => document.getElementById(id);
const arrows = [...document.querySelectorAll("[data-direction]")];
const help = byId("instructions");
const victory = byId("victory");
const confetti = victory.querySelector(".confetti");
const advice = "Gunakan Hint untuk melihat satu langkah menuju dok.";
const directionName = {
  up: "atas ↑",
  right: "kanan →",
  down: "bawah ↓",
  left: "kiri ←",
};
const view = createBoardView(select);
let game;
let task = new AbortController();
let mode = "generating";
let pendingRound;

function interrupt() {
  task.abort();
  task = new AbortController();
  return task.signal;
}

function locked() {
  return !game || mode === "generating" || mode === "animating" || game.won;
}

function render() {
  const disabled = locked();
  arrows.forEach((button) => {
    button.disabled = disabled;
  });
  for (const id of ["hint", "solve"])
    byId(id).disabled = disabled || mode === "searching";
  byId("undo").disabled = disabled || !game.history.length;
  byId("reset").disabled = byId("reset-key").disabled = !game;
  if (!game) return;
  const { round } = game;
  const target = robots[round.target];
  view.render(game, disabled);
  byId("round").textContent = "Ronde " + String(round.number).padStart(2, "0");
  byId("target").textContent = "Antarkan " + target.name + " ke dok";
  byId("dock").textContent =
    "Berhenti tepat di dok " + target.color + " " + target.symbol + ".";
  byId("help-goal").textContent =
    byId("target").textContent + " " + target.color + " " + target.symbol + ".";
  document
    .querySelector(".objective")
    .style.setProperty("--accent", target.accent);
  byId("active").textContent = "Gerakkan " + robots[game.active].name;
  byId("moves").textContent = game.history.length;
  byId("minimum").textContent = round.minimum;
}

function install(round) {
  game = startRound(round);
  mode = "playing";
  pendingRound = null;
  byId("retry").hidden = true;
  byId("status").textContent = advice;
  render();
}

async function generate() {
  const signal = interrupt();
  mode = "generating";
  byId("retry").hidden = true;
  byId("status").textContent = "Mencari dok untuk ronde baru…";
  render();
  const result = await pendingRound(signal);
  if (signal.aborted) return;
  if (!result.round) {
    const exhausted = result.status === "exhausted";
    byId("retry").hidden = exhausted;
    byId("status").textContent = exhausted
      ? "Tidak ada kandidat dok. Pilih New Game."
      : "Pencarian belum selesai. Coba lagi atau pilih New Game.";
    return;
  }
  if (result.round.number === 1) saveChapter(result.round);
  else result.round.facing = [...game.facing];
  install(result.round);
}

function newChapter() {
  victory.close();
  const board = createChapter();
  pendingRound = prepareRound(board, board.positions, 1);
  generate();
}

function reset() {
  if (!game) return;
  interrupt();
  victory.close();
  install(game.round);
}

function select(robot) {
  if (locked() || help.open) return;
  game.active = robot;
  render();
}

function afterMove() {
  render();
  if (!game.won) return;
  const { round, history } = game;
  byId("winner").src = robots[round.target].image;
  byId("summary").textContent =
    robots[round.target].name +
    " berhenti tepat di dok." +
    (history.length === round.minimum ? " Solusi optimal!" : "");
  byId("actual").textContent = history.length;
  byId("optimal").textContent = round.minimum;
  victory.showModal();
  showConfetti(confetti, robots.map((robot) => robot.accent));
}

async function playSlide(robot, direction, end, signal) {
  mode = "animating";
  game.active = robot;
  render();
  await view.animate(robot, direction, game.positions[robot], end, signal);
  if (signal.aborted) return false;
  return applyMove(game, robot, direction);
}

async function move(direction) {
  if (locked() || help.open) return;
  const robot = game.active;
  const end = slide(game.round, game.positions, robot, direction);
  if (end === game.positions[robot]) return;
  byId("status").textContent = advice;
  if (!(await playSlide(robot, direction, end, interrupt()))) return;
  mode = "playing";
  afterMove();
}

async function assist(animate) {
  if (locked() || mode === "searching") return;
  const signal = interrupt();
  mode = "searching";
  byId("status").textContent = "Mencari jalur terpendek…";
  render();
  const result = await runSearch(
    createSearch(game.round, game.positions, { goal: game.round }),
    budgets.solution,
    signal,
  );
  if (signal.aborted) return;
  mode = "playing";
  if (result.status !== "found") {
    byId("status").textContent =
      result.status === "limited"
        ? "Pencarian belum selesai"
        : "Tidak ada solusi dari posisi ini";
    render();
    return;
  }
  const describe = (step) =>
    robots[step.robot].name + " ke " + directionName[step.direction];
  if (!animate) {
    byId("status").textContent = describe(result.path[0]);
    render();
    return;
  }
  for (const [i, step] of result.path.entries()) {
    const end = slide(game.round, game.positions, step.robot, step.direction);
    byId("status").textContent =
      i + 1 + "/" + result.path.length + " · " + describe(step);
    if (!(await playSlide(step.robot, step.direction, end, signal))) return;
  }
  mode = "playing";
  afterMove();
}

byId("help").onclick = () => {
  if (mode === "searching" || mode === "animating") {
    interrupt();
    mode = "playing";
    byId("status").textContent = advice;
    render();
  }
  help.showModal();
};
for (const button of help.querySelectorAll("button"))
  button.onclick = () => help.close();
victory.addEventListener("cancel", (e) => e.preventDefault());
victory.addEventListener("close", () => confetti.replaceChildren());
byId("next").onclick = () => {
  victory.close();
  pendingRound = prepareRound(
    game.round,
    game.positions,
    game.round.number + 1,
    game.round,
  );
  generate();
};
byId("new").onclick = byId("new-win").onclick = newChapter;
byId("reset").onclick = byId("reset-key").onclick = reset;
byId("retry").onclick = generate;
byId("hint").onclick = () => assist(false);
byId("solve").onclick = () => assist(true);
byId("undo").onclick = () => {
  if (locked()) return;
  interrupt();
  mode = "playing";
  undo(game);
  byId("status").textContent = advice;
  render();
};
arrows.forEach((button) => {
  button.onclick = () => move(button.dataset.direction);
});
bindKeyboard({ select, move, reset });
const saved = loadChapter();
if (saved) install(saved);
else newChapter();
