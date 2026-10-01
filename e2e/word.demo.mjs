// The demo, driven as a person drives it: taps on a real page. Each flow ends by checking that the page fits the
// screen and nothing was complained of. `pnpm test:demo` builds the demo and runs these.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

/** Open the demo (or another page of it), the computers moving at once, and collect anything the page complains of. */
async function open(page, address = "?lang=en") {
  if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm site` first (`pnpm test:demo` does)");
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.route("http://kotoba.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.addInitScript(() => {
    window.kotobaTest = true;
  });
  await page.goto(`http://kotoba.test/${address}`);
  if (!address.startsWith("api")) await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
  else await expect(page.locator("h1")).toBeVisible();
  return errors;
}

async function tap(page, selector) {
  const target = typeof selector === "string" ? page.locator(selector).first() : selector;
  await target.scrollIntoViewIfNeeded();
  if (test.info().project.use.hasTouch === true) await target.tap();
  else await target.click();
}

/** The page fits the screen, and everything to press is at least 44 pixels. */
async function sound(page, errors) {
  const found = await page.evaluate(() => {
    const seen = (el) => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== "hidden";
    };
    const small = [...document.querySelectorAll("button:not(:disabled), input, select, nav a, footer .family a")]
      .filter(seen)
      .map((el) => ({ what: `${el.id} ${el.className} ${el.textContent.trim().slice(0, 20)}`, box: el.getBoundingClientRect() }))
      .filter(({ what, box }) => (what.includes("key") ? box.height < 43.5 : box.width < 43.5 || box.height < 43.5))
      .map(({ what, box }) => `${what} ${Math.round(box.width)}×${Math.round(box.height)}`);
    return { over: document.documentElement.scrollWidth - window.innerWidth, small };
  });
  expect(found.over, "the page scrolls sideways").toBeLessThanOrEqual(0);
  expect(found.small, "something to press is under 44px").toEqual([]);
  expect(errors, "the page complained").toEqual([]);
}

const status = (page) => page.locator('[data-testid="status"]');
const cells = (page, row) => page.locator('[data-testid="grid"] .row').nth(row).locator(".cell");
const hidden = (page) => page.evaluate(() => window.kotobaState.hidden);
const key = (page, letter) => page.locator(`[data-testid="keys"] .key[data-letter="${letter}"]`);

async function typeWord(page, word) {
  for (const letter of word) await tap(page, key(page, letter));
}

test("opens on English, five letters, six empty rows, and a keyboard", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("h1")).toHaveText("Kotoba言葉");
  await expect(page.locator('[data-testid="grid"] .row')).toHaveCount(6);
  await expect(cells(page, 0)).toHaveCount(5);
  await expect(status(page)).toContainText("Guess the 5-letter word");
  await expect(page.locator('[data-testid="keys"] .key[data-letter]')).toHaveCount(26);
  await expect(page.locator("footer .family a[aria-current='page']")).toHaveText("Kotoba");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toMatch(/^rgb\((244, 239, 228|20, 22, 20)\)$/);
  await sound(page, errors);
});

test("typing the hidden word wins, with a score, and the row is all green", async ({ page }) => {
  const errors = await open(page, "?lang=en&seed=3");
  const word = await hidden(page);
  expect(word).toMatch(/^[a-z]{5}$/);
  await typeWord(page, word);
  await expect(cells(page, 0).first()).toHaveText(word[0].toUpperCase());
  await tap(page, '[data-testid="keys"] [data-act="enter"]');
  await expect(status(page)).toContainText("Found it in 1!");
  await expect(status(page)).toContainText("points");
  await expect(cells(page, 0).locator("xpath=.")).toHaveCount(5);
  for (let at = 0; at < 5; at += 1) await expect(cells(page, 0).nth(at)).toHaveAttribute("data-mark", "hit");
  await sound(page, errors);
});

test("a guess that is not a word is refused, and one that is short is told so", async ({ page }) => {
  await open(page, "?lang=en&seed=3");
  await typeWord(page, "qqqqq");
  await tap(page, '[data-testid="keys"] [data-act="enter"]');
  await expect(status(page)).toHaveText("That is not in the word list.");
  await tap(page, '[data-testid="keys"] [data-act="back"]');
  await tap(page, '[data-testid="keys"] [data-act="back"]');
  await tap(page, '[data-testid="keys"] [data-act="back"]');
  await tap(page, '[data-testid="keys"] [data-act="back"]');
  await tap(page, '[data-testid="keys"] [data-act="back"]');
  await tap(page, '[data-testid="keys"] [data-act="enter"]');
  await expect(status(page)).toHaveText("Not enough letters.");
});

test("a wrong word is marked by the package's own rule, and six wrong words lose and show the word", async ({ page }) => {
  const errors = await open(page, "?lang=en&seed=3");
  const word = await hidden(page);
  // Every row guesses a word from the list that is not the hidden one.
  const tries = await page.evaluate(async () => {
    const { EN_WORDS } = await import("/dist/lists/words-en.data.js");
    const { readWordLists } = await import("/dist/index.js");
    const lists = readWordLists(EN_WORDS, 5);
    return lists.answers.filter((one) => one !== window.kotobaState.hidden).slice(0, 6);
  });
  for (let row = 0; row < 6; row += 1) {
    await typeWord(page, tries[row]);
    await tap(page, '[data-testid="keys"] [data-act="enter"]');
    const expected = await page.evaluate(async ([guess, secret]) => {
      const { markGuess } = await import("/dist/index.js");
      return markGuess(guess, secret);
    }, [tries[row], word]);
    for (let at = 0; at < 5; at += 1) await expect(cells(page, row).nth(at)).toHaveAttribute("data-mark", expected[at]);
  }
  await expect(status(page)).toContainText(`The word was ${word}`);
  await sound(page, errors);
});

test("the keyboard of the device types too, and Delete takes a letter back", async ({ page }) => {
  await open(page, "?lang=en&seed=3");
  await page.keyboard.press("c");
  await page.keyboard.press("a");
  await expect(cells(page, 0).first()).toHaveText("C");
  await page.keyboard.press("Backspace");
  await expect(cells(page, 0).nth(1)).toHaveText("");
});

test("French has its own keyboard, German keeps ä ö ü, and the word is in that language's alphabet", async ({ page }) => {
  const errors = await open(page, "?lang=en");
  await tap(page, '[data-testid="languages"] [data-lang-id="fr"]');
  await expect(page.locator('[data-testid="keys"] .key-row').first().locator(".key").first()).toHaveText("A");
  await expect(page.locator('[data-testid="keys"] .key-row').first().locator(".key").nth(1)).toHaveText("Z");
  await expect.poll(() => page.evaluate(() => window.kotobaState.lists !== null)).toBe(true);
  await tap(page, '[data-testid="languages"] [data-lang-id="de"]');
  await expect(page.locator('[data-testid="keys"] .key[data-letter="ü"]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => window.kotobaState.lists !== null && window.kotobaState.lang === "de")).toBe(true);
  expect(await hidden(page)).toMatch(/^[a-zäöüß]{5}$/);
  await sound(page, errors);
});

test("the length changes the board: four and six letters", async ({ page }) => {
  await open(page, "?lang=en");
  await tap(page, '[data-testid="sizes"] [data-size="6"]');
  await expect(cells(page, 0)).toHaveCount(6);
  await tap(page, '[data-testid="sizes"] [data-size="4"]');
  await expect(cells(page, 0)).toHaveCount(4);
  await expect.poll(async () => (await hidden(page)).length).toBe(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("kana: romaji becomes kana as it is typed, small and marked forms are keys, and the word can be won", async ({ page }) => {
  const errors = await open(page, "?lang=en&seed=3");
  await tap(page, '[data-testid="languages"] [data-lang-id="ja"]');
  await expect(cells(page, 0)).toHaveCount(4);
  await expect.poll(() => page.evaluate(() => window.kotobaState.lists !== null && window.kotobaState.lang === "ja")).toBe(true);
  await expect(status(page)).toContainText("4-kana");
  await typeWord(page, "ka");
  await expect(cells(page, 0).first()).toHaveText("か");
  await typeWord(page, "shi");
  await expect(cells(page, 0).nth(1)).toHaveText("し");
  await tap(page, '[data-testid="keys"] [data-act="mark"]');
  await expect(cells(page, 0).nth(1)).toHaveText("じ");
  await tap(page, '[data-testid="keys"] [data-letter="k"]');
  await expect(cells(page, 0).nth(2)).toHaveAttribute("data-pending", "k");
  await tap(page, '[data-testid="keys"] [data-act="back"]');
  await tap(page, '[data-testid="keys"] [data-act="back"]');
  await tap(page, '[data-testid="keys"] [data-act="back"]');
  await expect(cells(page, 0).first()).toHaveText("");
  // Typing the hidden word's kana straight into the state, then Enter, wins.
  await page.evaluate(() => {
    window.kotobaState.kana = [...window.kotobaState.hidden];
  });
  await page.keyboard.press("Enter");
  await expect(status(page)).toContainText("Found it in 1!");
  await sound(page, errors);
});

test("a kana guess is marked by the package's own rule", async ({ page }) => {
  await open(page, "?lang=en&seed=3");
  await tap(page, '[data-testid="languages"] [data-lang-id="ja"]');
  await expect.poll(() => page.evaluate(() => window.kotobaState.lists !== null && window.kotobaState.lang === "ja")).toBe(true);
  const { guess, expected } = await page.evaluate(async () => {
    const { markKanaGuess } = await import("/dist/index.js");
    const state = window.kotobaState;
    const other = state.lists.answers.find((word) => word !== state.hidden);
    state.kana = [...other];
    return { guess: other, expected: markKanaGuess([...other], [...state.hidden]).map((one) => one.mark) };
  });
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press("Enter");
  for (let at = 0; at < expected.length; at += 1) await expect(cells(page, 0).nth(at)).toHaveAttribute("data-mark", expected[at]);
  expect(guess.length).toBe(4);
});

test("the cloth patches in the header change the felt behind the board", async ({ page }) => {
  await open(page);
  const felt = () => page.locator(".game").evaluate((el) => getComputedStyle(el).backgroundImage);
  const green = await felt();
  await tap(page, 'button[data-cloth="wood"]');
  expect(await felt()).not.toBe(green);
  await tap(page, 'button[data-cloth="green"]');
  expect(await felt()).toBe(green);
});

test("in Japanese the page speaks Japanese, and the unreviewed note shows", async ({ page }) => {
  const errors = await open(page, "?lang=en");
  await tap(page, 'button[data-lang="ja"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator('[data-testid="new"]')).toHaveText("新しい単語");
  await expect(status(page)).toContainText("文字の単語を当ててください");
  await expect(page.locator("#unreviewed")).toBeVisible();
  await sound(page, errors);
  await tap(page, 'button[data-lang="en"]');
  await expect(page.locator("#unreviewed")).toBeHidden();
});

test("the API reference is in the family's frame and links back", async ({ page }) => {
  const errors = await open(page, "api.html?lang=en");
  await expect(page.locator("h1")).toHaveText("Kotoba言葉");
  expect(await page.locator("article[data-kind]").count()).toBeGreaterThan(30);
  await expect(page.locator("header nav a", { hasText: "The game" })).toHaveAttribute("href", "./");
  await sound(page, errors);
});

// The Help switch in the family header (scripts/family-template.mjs): off, the page is as it was; on, every
// option row says in one line what it does, in the page's language, and every control in it has hover words.
test("Help is off at first, and on it shows a line under each option row, in either language, without resizing the play area", async ({ page }) => {
  const errors = await open(page);
  const lines = page.locator(".fam-help");
  const rows = page.locator("[data-help-en]");
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(page.locator("[data-help-switch]")).toHaveAttribute("aria-pressed", "false");
  await expect(lines.first()).toBeHidden();
  const surface = page.locator('[data-testid="grid"]').first();
  const before = await surface.boundingBox();
  await page.locator("[data-help-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("data-help", "on");
  for (const row of await rows.all()) {
    // A row in a tab that is not showing has its line, and shows it when the tab opens.
    if (await row.isVisible()) {
      const shown = await row.evaluate((el) => {
        const line = el.classList.contains("fam-seg") || el.hasAttribute("data-help-after") ? el.nextElementSibling : el.querySelector(":scope > .fam-help");
        return line !== null && line.classList.contains("fam-help") && window.getComputedStyle(line).display !== "none" && line.textContent.length > 10;
      });
      expect(shown).toBe(true);
    }
    expect(((await row.getAttribute("data-help-en")) ?? "").length).toBeGreaterThan(10);
    expect(((await row.getAttribute("data-help-ja")) ?? "").length).toBeGreaterThan(4);
  }
  const after = await surface.boundingBox();
  // The play area keeps its box (to a fraction of a pixel).
  expect(Math.abs(after.width - before.width)).toBeLessThan(0.5);
  expect(Math.abs(after.height - before.height)).toBeLessThan(0.5);
  // Every button in an option row says what it does on hover.
  const untitled = await page.evaluate(() => [...document.querySelectorAll("[data-help-en] button")].filter((b) => !b.title).map((b) => b.textContent.trim()));
  expect(untitled).toEqual([]);
  const english = await lines.first().textContent();
  await page.locator('[data-lang="ja"]').click();
  await expect(lines.first()).not.toHaveText(english);
  // The choice is kept, and turning it off hides every line again.
  await page.reload();
  await expect(page.locator("[data-help-switch]")).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-help-switch]").click();
  await expect(lines.first()).toBeHidden();
  expect(errors).toEqual([]);
});
