const between = (min, max) => min + Math.random() * (max - min);

export function showConfetti(layer, colors) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const palette = [...colors, "#ffc842", "#e95091", "#36c9df"];
  const pieces = document.createDocumentFragment();
  const compact = window.innerWidth < 600;
  const burstSize = compact ? 42 : 66;
  const count = burstSize * 2 + (compact ? 38 : 64);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("i");
    piece.style.backgroundColor = palette[i % palette.length];
    piece.style.setProperty("--spin", between(-640, 640) + "deg");
    piece.style.setProperty("--tilt", between(-90, 90) + "deg");
    if (i < burstSize * 2) {
      // Two volleys launch inward, crest at different heights, then fall.
      const side = i % 2 === 0 ? 1 : -1;
      const reach = side * between(10, 59);
      piece.className = "burst";
      piece.style.left = side === 1 ? "1%" : "99%";
      piece.style.top = between(64, 82) + "%";
      piece.style.setProperty("--crest-x", reach * 0.66 + "vw");
      piece.style.setProperty("--crest-y", -between(30, 76) + "dvh");
      piece.style.setProperty("--land-x", reach + "vw");
      piece.style.animationDelay = ((i < burstSize ? 0 : 0.65) + between(0, 0.13)) + "s";
      piece.style.animationDuration = between(1.7, 2.5) + "s";
    } else {
      piece.className = "shower";
      piece.style.left = between(1, 99) + "%";
      piece.style.setProperty("--drift", between(-10, 10) + "vw");
      piece.style.animationDelay = between(0.25, 1.2) + "s";
      piece.style.animationDuration = between(2.1, 3) + "s";
    }
    pieces.append(piece);
  }
  layer.replaceChildren(pieces);
}
