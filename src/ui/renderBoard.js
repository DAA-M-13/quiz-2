const art = import.meta.glob("../assets/robots/*.svg", {
  eager: true,
  import: "default",
});
export const robots = [
  ["Ruby", "merah", "●", "#e26464"],
  ["Mint", "hijau", "▲", "#53aa88"],
  ["Volt", "kuning", "◆", "#e5b85c"],
  ["Byte", "biru", "■", "#568eca"],
].map(([name, color, symbol, accent]) => ({
  name,
  color,
  symbol,
  accent,
  image: art["../assets/robots/" + name.toLowerCase() + ".svg"],
}));

function offset(cell, size) {
  return {
    left: ((cell % size) * 100) / size + "%",
    top: (Math.floor(cell / size) * 100) / size + "%",
  };
}

export function createBoardView(select) {
  const board = document.querySelector("#board");
  const choices = document.querySelector("#robots");
  let round;
  const tokens = [];
  const buttons = [];
  for (const axis of document.querySelectorAll(".axis")) {
    for (let i = 1; i <= 16; i++)
      axis.append(
        Object.assign(document.createElement("span"), { textContent: i }),
      );
  }
  robots.forEach((robot, i) => {
    const token = document.createElement("button");
    token.className = "token";
    const portrait = document.createElement("img");
    portrait.src = robot.image;
    portrait.alt = "";
    token.append(portrait);
    token.addEventListener("click", () => select(i));
    tokens.push(token);
    const choice = document.createElement("button");
    choice.innerHTML =
      "<small>" +
      (i + 1) +
      '</small><img alt="" src="' +
      robot.image +
      '"><b>' +
      robot.name +
      "</b>";
    choice.setAttribute(
      "aria-label",
      i + 1 + ". " + robot.name + ", " + robot.color,
    );
    choice.addEventListener("click", () => select(i));
    choices.append(choice);
    buttons.push(choice);
  });

  function drawGrid(next) {
    const { size, target, dock, walls } = next;
    const cells = Array.from({ length: size * size }, () =>
      Object.assign(document.createElement("div"), { className: "cell" }),
    );
    for (const pair of walls) {
      const low = Math.min(...pair);
      cells[low].classList.add(
        Math.abs(pair[0] - pair[1]) === 1 ? "east" : "south",
      );
    }
    if (next.blockedCells?.length) {
      const block = document.createElement("div");
      block.className = "center-block";
      block.setAttribute("role", "img");
      block.setAttribute("aria-label", "Rintangan tengah, baris 8–9 dan kolom 8–9");
      cells[next.blockedCells[0]].append(block);
    }
    const marker = document.createElement("span");
    marker.className = "dock";
    marker.style.setProperty("--accent", robots[target].accent);
    marker.textContent = robots[target].symbol;
    marker.title = "Dok " + robots[target].name;
    cells[dock].append(marker);
    board.replaceChildren(...cells, ...tokens);
    round = next;
  }
  return {
    render(game, locked) {
      if (round !== game.round) drawGrid(game.round);
      robots.forEach((robot, i) => {
        const cell = game.positions[i];
        Object.assign(tokens[i].style, offset(cell, round.size));
        tokens[i].dataset.cell = cell;
        tokens[i].dataset.facing = game.facing[i];
        tokens[i].setAttribute(
          "aria-label",
          robot.name +
            ", baris " +
            (1 + Math.floor(cell / round.size)) +
            ", kolom " +
            (1 + (cell % round.size)),
        );
        for (const control of [tokens[i], buttons[i]]) {
          control.disabled = locked;
          control.setAttribute("aria-pressed", String(i === game.active));
        }
      });
    },
    async animate(robot, direction, from, to, signal) {
      tokens[robot].dataset.facing = direction;
      const animation = tokens[robot].animate(
        [offset(from, round.size), offset(to, round.size)],
        {
          duration: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 70
            : 450,
          easing: "ease-out",
          fill: "forwards",
        },
      );
      const cancel = () => animation.cancel();
      signal.addEventListener("abort", cancel, { once: true });
      try {
        await animation.finished;
      } catch (error) {
        if (!signal.aborted) throw error;
      } finally {
        signal.removeEventListener("abort", cancel);
        animation.cancel();
      }
    },
  };
}
