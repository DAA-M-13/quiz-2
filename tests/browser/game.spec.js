import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";

const storageKey = "robot-seluncur.chapter.v1";
// Embed the two-step geometry on a full-size board using the UI robot order.
const round = {
  size: 16,
  number: 1,
  positions: [255, 16, 240, 4],
  walls: [[20, 36]],
  target: 1,
  dock: 19,
  minimum: 2,
};
const cells = (page) =>
  page
    .locator(".token")
    .evaluateAll((tokens) => tokens.map((t) => Number(t.dataset.cell)));
const count = (page, n) => expect(page.locator("#moves")).toHaveText(String(n));
async function setBudget(page, kind, states) {
  await page.evaluate(
    async ([kind, states]) => {
      // Vite adds a version to module URLs after hot updates. Use the app's exact instance.
      const entry = performance
        .getEntriesByType("resource")
        .find((r) => new URL(r.name).pathname === "/src/algorithms/bfs.js");
      const { budgets } = await import(entry.name);
      budgets[kind].states = states;
    },
    [kind, states],
  );
}
async function openFixture(page, fixture = round) {
  await page.goto("/");
  await expect(page.locator("#solve")).toBeEnabled();
  await page.evaluate(
    ([key, data]) => localStorage.setItem(key, JSON.stringify(data)),
    [storageKey, fixture],
  );
  await page.reload();
  await expect(page.locator("#robots button").first()).toBeEnabled();
}

test("U-01–12, U-16–17 · controls, dialogs, retry, animation and chapter lifecycle", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openFixture(page);
  await expect(page.locator(".cell")).toHaveCount(256);
  await page.keyboard.press("ArrowLeft");
  await count(page, 0);
  await expect(page.locator("#undo")).toBeDisabled();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".token").nth(1)).toHaveAttribute("data-cell", "31");
  await count(page, 1);
  await expect(page.locator("#victory")).not.toBeVisible();
  await page.click("#help");
  await page.keyboard.press("ArrowLeft");
  await page.click(".dismiss");
  await count(page, 1);
  await page.click("#undo");
  expect(await cells(page)).toEqual(round.positions);

  await page.click("#hint");
  await expect(page.locator("#status")).toHaveText("Byte ke bawah ↓");
  await page.click("#solve");
  await expect(page.locator("#algorithms")).toBeVisible();
  await expect(page.locator("#algorithm-bfs")).toBeEnabled();
  await expect(page.locator("#algorithms button:disabled")).toHaveCount(2);
  await page.click("#algorithm-bfs");
  await expect(page.locator("#status")).toContainText("1/2 · Byte ke bawah");
  await expect(page.locator("#undo")).toBeDisabled();
  await expect(page.locator("#solve")).toBeDisabled();
  await page.keyboard.press("ArrowRight");
  await page.click("#reset");
  await page.waitForTimeout(800);
  expect(await cells(page)).toEqual(round.positions);
  await count(page, 0);
  await expect(page.locator("#victory")).not.toBeVisible();

  await page.click("#robots button:nth-child(4)");
  await page.keyboard.press("1");
  await expect(page.locator("#active")).toHaveText("Gerakkan Ruby");
  await page.keyboard.press("4");
  await page.click("[data-direction=down]");
  await count(page, 1);
  await page.click("#hint");
  await expect(page.locator("#status")).toHaveText("Mint ke kanan →");
  await expect(page.locator("#minimum")).toHaveText("2");
  await page.locator(".token").nth(1).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#actual")).toHaveText("2");
  await expect(page.locator("#optimal")).toHaveText("2");
  const end = await cells(page);
  const walls = await page.locator(".east,.south").count();
  await setBudget(page, "generation", 0);
  await page.click("#next");
  await expect(page.locator("#retry")).toBeVisible();
  expect(await cells(page)).toEqual(end);
  await setBudget(page, "generation", 900);
  await page.click("#retry");
  await expect(page.locator("#round")).toHaveText("Ronde 02");
  expect(await cells(page)).toEqual(end);
  expect(await page.locator(".east,.south").count()).toBe(walls);
  await count(page, 0);
  await expect(page.locator("#undo")).toBeDisabled();
  const minimum = await page.locator("#minimum").textContent();
  const dock = await page.locator("#dock").textContent();
  await page.keyboard.press("4");
  await page.keyboard.press("ArrowUp");
  await count(page, 1);
  await page.click("#reset");
  expect(await cells(page)).toEqual(end);
  await count(page, 0);
  await expect(page.locator("#minimum")).toHaveText(minimum);
  await expect(page.locator("#dock")).toHaveText(dock);
  await expect(page.locator("#undo")).toBeDisabled();
  await page.click("#solve");
  await page.click("#algorithm-bfs");
  await expect(page.locator("#victory")).toBeVisible();
  expect(await page.locator("#actual").textContent()).toBe(
    await page.locator("#optimal").textContent(),
  );
  await page.reload();
  await expect(page.locator("#round")).toHaveText("Ronde 01");
  expect(await cells(page)).toEqual(round.positions);
  await expect(page.locator("#target")).toContainText("Mint");
  await expect(page.locator("#minimum")).toHaveText("2");
  await page.click("#solve");
  await page.click("#algorithm-bfs");
  await expect(page.locator("#status")).toContainText("1/2");
  await page.click("#new");
  await expect(page.locator("#robots button").first()).toBeEnabled();
  await expect(page.locator(".cell").nth(119).locator(".center-block")).toBeVisible();
  const fresh = await cells(page);
  expect(fresh).not.toEqual(round.positions);
  expect(await page.locator(".east,.south").count()).toBeGreaterThan(1);
  await page.waitForTimeout(800);
  expect(await cells(page)).toEqual(fresh);
  await expect(page.locator("#victory")).not.toBeVisible();
  await count(page, 0);
  expect(errors).toEqual([]);
});

test("U-14–17 · budget, exhaustion and stale Hint", async ({ page }) => {
  await openFixture(page);
  await setBudget(page, "solution", 1);
  await page.click("#hint");
  await expect(page.locator("#status")).toHaveText("Pencarian belum selesai");
  await count(page, 0);
  await setBudget(page, "solution", 1000);
  await page.click("#hint");
  await expect(page.locator("#status")).toHaveText("Byte ke bawah ↓");

  // A move in the same turn invalidates even a search just about to publish.
  await page.evaluate(() => {
    document.querySelector("#hint").click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
  });
  await count(page, 1);
  await expect(page.locator("#status")).not.toHaveText("Byte ke bawah ↓");
  const trapped = {
    ...round,
    target: 1,
    positions: [0, 17, 15, 255],
    dock: 42,
    walls: [
      [17, 1],
      [17, 16],
      [17, 18],
      [17, 33],
      [0, 1],
      [0, 16],
      [15, 14],
      [15, 31],
      [255, 254],
      [255, 239],
    ],
  };
  await openFixture(page, trapped);
  await page.click("#hint");
  await expect(page.locator("#status")).toHaveText(
    "Tidak ada solusi dari posisi ini",
  );
  await page.click("#reset");
  await count(page, 0);
});

test("Konfeti muncul setelah menang manual atau Solve dan dibersihkan saat lanjut", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openFixture(page);
  const pieces = page.locator("#victory .confetti i");
  await page.keyboard.press("4");
  await page.keyboard.press("ArrowDown");
  await count(page, 1);
  await expect(pieces).toHaveCount(0);
  await page.keyboard.press("2");
  await page.keyboard.press("ArrowRight");
  await expect(pieces.first()).toBeVisible();
  await expect(page.locator(".confetti .shower").first()).toBeAttached();
  // Capture the first volley near its crest for visual comparison.
  await page.waitForTimeout(650);
  await page.screenshot({ path: "evaluation/victory.png" });
  await page.click("#next");
  await expect(pieces).toHaveCount(0);

  await page.click("#solve");
  await page.click("#algorithm-bfs");
  await expect(pieces.first()).toBeVisible();
  await page.click("#new-win");
  await expect(pieces).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.click("#solve");
  await page.click("#algorithm-bfs");
  await expect(page.locator("#victory")).toBeVisible();
  await expect(pieces).toHaveCount(0);
});

test("U-12 · mobile touch selection and single movement", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL: "http://127.0.0.1:5182",
  });
  const page = await context.newPage();
  await openFixture(page);
  await page.locator(".token").nth(3).tap();
  await page.locator("[data-direction=down]").tap();
  await count(page, 1);
  await page.locator("[data-direction=down]").tap();
  await count(page, 1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("U-13, U-18 · reproducible 16 × 16 browser benchmarks and solution replay", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  const measurements = await page.evaluate(async () => {
    const { createChapter } = await import("/src/core/chapterGenerator.js");
    const { prepareRound } = await import("/src/core/roundManager.js");
    const { createSearch, runSearch, budgets } = await import(
      "/src/algorithms/bfs.js"
    );
    const { applyMove, startRound } = await import("/src/core/gameState.js");
    const samples = [];
    for (const seed of [17, 29, 71]) {
      let state = seed;
      function random() {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
      }
      const board = createChapter(random);
      let positions = board.positions;
      let previous;
      for (let number = 1; number <= 2; number++) {
        const generation = await prepareRound(
          board,
          positions,
          number,
          previous,
        )(null, budgets.generation, random);
        const { round } = generation;
        if (previous?.target === round.target && previous.dock === round.dock)
          throw Error("Repeated pair");
        const search = (p) =>
          runSearch(createSearch(board, p, { goal: round }), budgets.solution);
        const hint = await search(positions);
        const solve = await search(positions);
        if (
          hint.status !== "found" ||
          solve.path?.length !== round.minimum ||
          round.minimum < 1 ||
          JSON.stringify(hint.path) !== JSON.stringify(solve.path)
        )
          throw Error("BFS mismatch");
        const game = startRound(round);
        for (const step of solve.path)
          if (!applyMove(game, step.robot, step.direction))
            throw Error("Blocked replay");
        if (!game.won) throw Error("Missing goal");
        const stats = (r) => ({
          status: r.status,
          expanded: r.expanded,
          ms: +r.duration.toFixed(2),
        });
        const detour = startRound(round);
        for (let step = 0; step < 4; step++) {
          const robot = (round.target + 1 + (step % 3)) % 4;
          for (const direction of ["right", "up", "left", "down"]) {
            if (applyMove(detour, robot, direction)) break;
          }
        }
        const detourHint = await search(detour.positions);
        const detourSolve = await search(detour.positions);
        if (
          detourHint.status !== detourSolve.status ||
          JSON.stringify(detourHint.path) !== JSON.stringify(detourSolve.path)
        )
          throw Error("Detour searches disagree");
        samples.push({
          seed,
          round,
          detour: {
            positions: detour.positions,
            hint: stats(detourHint),
            solve: stats(detourSolve),
          },
          generation: stats(generation),
          hint: stats(hint),
          solve: stats(solve),
          path: solve.path,
        });
        previous = round;
        positions = game.positions;
      }
    }
    return { budgets, samples };
  });
  await mkdir("evaluation", { recursive: true });
  await writeFile(
    "evaluation/search.json",
    JSON.stringify(
      {
        browser: browser.version(),
        cpu: os.cpus()[0].model,
        platform: os.platform(),
        ...measurements,
      },
      null,
      2,
    ),
  );
  await expect(page.locator("#solve")).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator(".token img")
      .evaluateAll(
        (images) =>
          images.filter(
            (img) =>
              img.complete &&
              img.naturalWidth &&
              img.getBoundingClientRect().width > 0,
          ).length,
      ),
  ).toBe(4);
  await page.screenshot({ path: "evaluation/gameplay.png", fullPage: true });
});

test("All four robots turn before sliding, with the same timing for manual input and Solve", async ({ page }) => {
  await page.addInitScript(() => {
    window.robotSlides = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, timing) {
      if (this.matches(".token")) {
        window.robotSlides.push({
          facing: this.dataset.facing,
          duration: timing.duration,
          transform: getComputedStyle(this.querySelector("img")).transform,
        });
      }
      return animate.call(this, frames, timing);
    };
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openFixture(page, { ...round, positions: [34, 69, 104, 139], walls: [], dock: 117 });
  const directions = [
    ["ArrowUp", "up", "matrix(-1, 0, 0, -1, 0, 0)"],
    ["ArrowRight", "right", "matrix(0, -1, 1, 0, 0, 0)"],
    ["ArrowDown", "down", "none"],
    ["ArrowLeft", "left", "matrix(0, 1, -1, 0, 0, 0)"],
  ];
  for (let robot = 0; robot < 4; robot++) {
    await page.keyboard.press(String(robot + 1));
    for (const [i, [key, facing, transform]] of directions.entries()) {
      await page.keyboard.press(key);
      await count(page, i + 1);
      await expect(page.locator(".token").nth(robot)).toHaveAttribute("data-facing", facing);
      expect(await page.evaluate(() => window.robotSlides.at(-1))).toEqual({ facing, transform, duration: 450 });
    }
    await page.click("#undo");
    await expect(page.locator(".token").nth(robot)).toHaveAttribute("data-facing", "down");
    await page.click("#reset");
  }

  await openFixture(page);
  await page.click("#solve");
  await page.click("#algorithm-bfs");
  await expect(page.locator("#victory")).toBeVisible();
  expect(await page.evaluate(() => window.robotSlides.map(({ facing, duration }) => [facing, duration])))
    .toEqual([["down", 450], ["right", 450]]);
});
