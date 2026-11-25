const arrowKeys = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export function bindKeyboard({ select, move, reset }) {
  document.addEventListener("keydown", (event) => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      document.querySelector("dialog[open]")
    )
      return;
    if (event.key.toLowerCase() === "r" && !event.repeat) reset();
    else if (Object.hasOwn(arrowKeys, event.key)) {
      event.preventDefault();
      if (!event.repeat) move(arrowKeys[event.key]);
    } else if (/^[1-4]$/.test(event.key) && !event.repeat) {
      select(Number(event.key) - 1);
    }
  });
}
