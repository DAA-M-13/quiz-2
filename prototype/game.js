"use strict";

const size = 8;
const initial = [8, 4, 56, 63];
const dock = 11;
const target = 0;
const wall = [12, 20];
const robots = [
  { name: "Green", symbol: "G", color: "green" },
  { name: "Blue", symbol: "B", color: "blue" },
  { name: "Yellow", symbol: "Y", color: "yellow" },
  { name: "Red", symbol: "R", color: "red" }
];
const directions = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1]
};

function slide(positions, robot, direction) {
  const [dr, dc] = directions[direction];
  let cell = positions[robot];
  while (true) {
    const row = Math.floor(cell / size) + dr;
    const col = cell % size + dc;
    if (row < 0 || row >= size || col < 0 || col >= size) return cell;
    const next = row * size + col;
    const hitsWall = (cell === wall[0] && next === wall[1])
      || (cell === wall[1] && next === wall[0]);
    if (hitsWall || positions.includes(next)) return cell;
    cell = next;
  }
}

const board = document.querySelector("#board");
const choices = document.querySelector("#robots");
const movesLabel = document.querySelector("#moves");
const status = document.querySelector("#status");
document.querySelector("#objective").textContent =
  `Stop the ${robots[target].color} robot on its target tile.`;
const arrows = document.querySelectorAll("[data-direction]");
let positions = [...initial];
let active = target;
let moves = 0;
let won = false;

const cells = Array.from({ length: size * size }, (_, index) => {
  const cell = document.createElement("div");
  cell.className = "cell";
  if (index === dock) {
    cell.classList.add("dock");
    cell.title = `${robots[target].name} target tile`;
  }
  if (index === wall[0]) cell.classList.add("wall");
  board.append(cell);
  return cell;
});

function select(index) {
  active = index;
  render();
}

const selectors = [];
const tokens = robots.map(({ name, symbol, color }, index) => {
  const choice = document.createElement("button");
  choice.textContent = `${index + 1}. ${name}`;
  choice.addEventListener("click", () => select(index));
  choices.append(choice);
  selectors.push(choice);

  const token = document.createElement("button");
  token.className = `token ${color}`;
  token.textContent = symbol;
  token.addEventListener("click", () => select(index));
  return token;
});

function render() {
  const focusedToken = tokens.indexOf(document.activeElement);
  tokens.forEach((token, index) => {
    const cell = positions[index];
    if (token.parentElement !== cells[cell]) cells[cell].append(token);
    const selected = String(index === active);
    token.setAttribute("aria-pressed", selected);
    selectors[index].setAttribute("aria-pressed", selected);
    const row = Math.floor(cell / size) + 1;
    const col = cell % size + 1;
    const targetLabel = index === target ? ", target robot" : "";
    token.setAttribute("aria-label", `${robots[index].name} robot${targetLabel}, row ${row}, column ${col}`);
  });
  if (focusedToken !== -1 && document.activeElement !== tokens[focusedToken]) {
    tokens[focusedToken].focus({ preventScroll: true });
  }
  movesLabel.textContent = moves;
  status.textContent = won ? `Target tile reached in ${moves} moves!` : "";
  arrows.forEach(button => { button.disabled = won; });
}

function move(direction) {
  if (won) return;
  const next = slide(positions, active, direction);
  if (next === positions[active]) return;
  positions[active] = next;
  moves += 1;
  won = positions[target] === dock;
  render();
}

arrows.forEach(button => {
  button.addEventListener("click", () => move(button.dataset.direction));
});

document.querySelector("#reset").addEventListener("click", () => {
  positions = [...initial];
  active = target;
  moves = 0;
  won = false;
  render();
});

const arrowKeys = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
document.addEventListener("keydown", event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (Object.hasOwn(arrowKeys, event.key)) {
    event.preventDefault();
    if (!event.repeat) move(arrowKeys[event.key]);
  } else if (/^[1-4]$/.test(event.key) && !event.repeat) {
    select(Number(event.key) - 1);
  }
});

render();
