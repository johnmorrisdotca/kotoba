// Takes the pictures the README shows, from the built demo in `site/`: `pnpm pictures` (builds the demo, then runs this).
// The page is served to a browser without a port, never fetched from the live site, and the same each run:
// the hidden word comes from a seed (`?seed=`), the guesses are chosen by a fixed rule from the package's own lists,
// and motion is reduced.
// Output: docs/desktop.jpg (1280 wide, light, English) and docs/phone.jpg (390 by 844, dark, Japanese kana).
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const docs = join(root, "docs");
const host = "http://kotoba.test";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const QUALITY = 76;

if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm pictures` (it builds the demo first)");
const browser = await chromium.launch();

/** Guess `rows` times, each a word from the list marked with one more right-place letter than the last, so the grid tells a story. */
async function guess(page, rows) {
  for (let row = 0; row < rows; row += 1) {
    await page.evaluate(async (row) => {
      const { markGuess, markKanaGuess } = await import("/dist/index.js");
      const state = window.kotobaState;
      const kana = state.lang === "ja";
      const mark = (word) => (kana ? markKanaGuess([...word], [...state.hidden]) : markGuess(word, state.hidden)).map((one) => (typeof one === "string" ? one : one.mark));
      const counts = (word) => {
        const marks = mark(word);
        return { hit: marks.filter((one) => one === "hit").length, near: marks.filter((one) => one === "near").length };
      };
      const words = state.lists.answers.filter((word) => word !== state.hidden && !state.guesses.some((one) => one.word === word));
      const enough = Math.max(2, state.hidden.length - 2);
      const fits = (word) => counts(word).hit === row && counts(word).hit + counts(word).near >= enough;
      const word = words.find(fits) ?? words.find((one) => counts(one).hit === row) ?? words[0];
      if (kana) state.kana = [...word];
      else state.letters = word;
    }, row);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press("Enter");
    await page.waitForFunction((row) => document.querySelectorAll('[data-testid="grid"] .row')[row].querySelector(".cell[data-mark]") !== null, row);
  }
}

async function shot({ width, height, colorScheme, lang, words, rows, path, scrollTo }) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: "reduce", locale: "en-US", deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.route(`${host}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.addInitScript(() => {
    window.kotobaTest = true;
  });
  await page.goto(`${host}/?lang=${lang}&words=${words}&seed=2026`);
  await page.waitForFunction(() => window.kotobaState?.lists !== null && window.kotobaState?.hidden !== "");
  await guess(page, rows);
  if (scrollTo) await page.locator(scrollTo).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
  else await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(0, 0);
  await page.screenshot({ path, type: "jpeg", quality: QUALITY });
  await context.close();
}

// From the top of the page, so the header, the language chooser and the cloth patches show: English, five letters, four guesses in.
await shot({ width: 1280, height: 900, colorScheme: "light", lang: "en", words: "en", rows: 4, path: join(docs, "desktop.jpg") });
// Four kana in Japanese, scrolled to the board.
await shot({ width: 390, height: 844, colorScheme: "dark", lang: "ja", words: "ja", rows: 3, path: join(docs, "phone.jpg"), scrollTo: '[data-testid="game"]' });
await browser.close();
