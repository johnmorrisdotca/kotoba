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

/** The plain hiragana as romaji, so that a kana word can be typed on the keys the page has. Anything else is null. */
const ROMAJI = Object.fromEntries(
  Object.entries({
    a: "あ", i: "い", u: "う", e: "え", o: "お", ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ", sa: "さ", si: "し", su: "す", se: "せ", so: "そ", ta: "た", ti: "ち", tu: "つ", te: "て", to: "と",
    na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の", ha: "は", hi: "ひ", hu: "ふ", he: "へ", ho: "ほ", ma: "ま", mi: "み", mu: "む", me: "め", mo: "も", ya: "や", yu: "ゆ", yo: "よ",
    ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ", wa: "わ", nn: "ん", ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご", za: "ざ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ", da: "だ", de: "で", do: "ど",
    ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ", pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  }).map(([romaji, kana]) => [kana, romaji]),
);
const romajiOf = (word) => ([...word].every((kana) => kana in ROMAJI) ? [...word].map((kana) => ROMAJI[kana]).join("") : null);

/** Guess `rows` times, each a word from the list marked with one more right-place letter than the last, so the grid tells a story. */
async function guess(page, rows, kana) {
  const guesses = [];
  for (let row = 0; row < rows; row += 1) {
    const typed = await page.evaluate(async ({ row, kana, done }) => {
      const { guessMarks } = await import("/dist/game.js");
      const { loadWordList } = await import("/dist/load.js");
      const game = window.kotobaState.play.game;
      const list = await loadWordList(game.language, game.size);
      const counts = (word) => {
        const marks = guessMarks(game, word).map((one) => one.mark);
        return { hit: marks.filter((one) => one === "hit").length, near: marks.filter((one) => one === "near").length };
      };
      const words = list.answers.filter((word) => word !== game.hidden && !done.includes(word));
      const enough = Math.max(2, game.hidden.length - 2);
      const fits = (word) => counts(word).hit === row && counts(word).hit + counts(word).near >= enough;
      return { words: words.filter(fits).slice(0, 400), others: words.filter((one) => counts(one).hit === row).slice(0, 400), any: words.slice(0, 400), kana };
    }, { row, kana, done: guesses });
    const pool = [...typed.words, ...typed.others, ...typed.any];
    const word = kana ? pool.find((one) => romajiOf(one) !== null) : pool[0];
    guesses.push(word);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.type(kana ? romajiOf(word) : word);
    await page.keyboard.press("Enter");
    await page.waitForFunction((row) => document.querySelectorAll('[data-kt="grid"] .kt-row')[row].querySelector(".kt-cell[data-mark]:not([data-mark='typed']):not([data-mark='empty'])") !== null, row);
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
  await page.waitForFunction(() => window.kotobaState?.play.game !== null && window.kotobaState?.hidden);
  await guess(page, rows, words === "ja");
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
