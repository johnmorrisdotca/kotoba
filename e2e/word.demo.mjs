// The demo, driven as a person drives it: taps on a real page. Each flow ends by checking that the page fits the
// screen and nothing was complained of. `pnpm test:demo` builds the demo and runs these.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

/** Open the demo (or another page of it), the computers moving at once, and collect anything the page complains of. */
async function open(page, address = "?lang=en") {
  if (!existsSync(join(site, "index.html")))
    throw new Error("site/ is not built: run `pnpm site` first (`pnpm test:demo` does)");
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.route("http://kotoba.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({
      body: readFileSync(file),
      contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream",
    });
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
      .map((el) => ({
        what: `${el.id} ${el.className} ${el.textContent.trim().slice(0, 20)}`,
        box: el.getBoundingClientRect(),
      }))
      .filter(({ what, box }) => (what.includes("key") ? box.height < 43.5 : box.width < 43.5 || box.height < 43.5))
      .map(({ what, box }) => `${what} ${Math.round(box.width)}×${Math.round(box.height)}`);
    return { over: document.documentElement.scrollWidth - window.innerWidth, small };
  });
  expect(found.over, "the page scrolls sideways").toBeLessThanOrEqual(0);
  expect(found.small, "something to press is under 44px").toEqual([]);
  expect(errors, "the page complained").toEqual([]);
}

const status = (page) => page.locator('[data-kt="status"]');
const cells = (page, row) => page.locator('[data-kt="grid"] .kt-row').nth(row).locator(".kt-cell");
const hidden = (page) => page.evaluate(() => window.kotobaState.hidden);
const key = (page, letter) => page.locator(`[data-kt="keys"] .kt-key[data-letter="${letter}"]`);

async function typeWord(page, word) {
  for (const letter of word) await tap(page, key(page, letter));
}

test("opens on English, five letters, six empty rows, and a keyboard", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("h1")).toHaveText("Kotoba言葉");
  await expect(page.locator('[data-kt="grid"] .kt-row')).toHaveCount(6);
  await expect(cells(page, 0)).toHaveCount(5);
  await expect(status(page)).toContainText("Guess the 5-letter word");
  await expect(page.locator('[data-kt="keys"] .kt-key[data-letter]')).toHaveCount(26);
  await expect(page.locator("footer .family a[aria-current='page']")).toHaveText("Kotoba");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toMatch(
    /^rgb\((244, 239, 228|20, 22, 20)\)$/,
  );
  await sound(page, errors);
});

test("typing the hidden word wins, with a score, and the row is all green", async ({ page }) => {
  const errors = await open(page, "?lang=en&seed=3");
  const word = await hidden(page);
  expect(word).toMatch(/^[a-z]{5}$/);
  await typeWord(page, word);
  await expect(cells(page, 0).first()).toHaveText(word[0].toUpperCase());
  await tap(page, '[data-kt="keys"] [data-act="enter"]');
  await expect(status(page)).toContainText("Found it in 1!");
  await expect(status(page)).toContainText("points");
  await expect(cells(page, 0).locator("xpath=.")).toHaveCount(5);
  for (let at = 0; at < 5; at += 1) await expect(cells(page, 0).nth(at)).toHaveAttribute("data-mark", "hit");
  await sound(page, errors);
});

test("a guess that is not a word is refused, and one that is short is told so", async ({ page }) => {
  await open(page, "?lang=en&seed=3");
  await typeWord(page, "qqqqq");
  await tap(page, '[data-kt="keys"] [data-act="enter"]');
  await expect(status(page)).toHaveText("That is not in the word list.");
  await tap(page, '[data-kt="keys"] [data-act="back"]');
  await tap(page, '[data-kt="keys"] [data-act="back"]');
  await tap(page, '[data-kt="keys"] [data-act="back"]');
  await tap(page, '[data-kt="keys"] [data-act="back"]');
  await tap(page, '[data-kt="keys"] [data-act="back"]');
  await tap(page, '[data-kt="keys"] [data-act="enter"]');
  await expect(status(page)).toHaveText("Not enough letters.");
});

test("a wrong word is marked by the package's own rule, and six wrong words lose and show the word", async ({
  page,
}) => {
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
    await tap(page, '[data-kt="keys"] [data-act="enter"]');
    const expected = await page.evaluate(
      async ([guess, secret]) => {
        const { markGuess } = await import("/dist/index.js");
        return markGuess(guess, secret);
      },
      [tries[row], word],
    );
    for (let at = 0; at < 5; at += 1) await expect(cells(page, row).nth(at)).toHaveAttribute("data-mark", expected[at]);
  }
  await expect(status(page)).toContainText(`The word was ${word}`);
  // The answer is the biggest thing there: a card of tiles over the keyboard's own place, which keeps its height.
  const card = page.locator('[data-kt="result"]');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-result", "lost");
  await expect(card.locator('[data-kt="answer"]')).toHaveAttribute("aria-label", word.toUpperCase());
  await expect(card.locator(".kt-result-tile")).toHaveText([...word]);
  const tile = await card.locator(".kt-result-tile").first().boundingBox();
  expect(tile.height).toBeGreaterThanOrEqual(36);
  const heights = await page.evaluate(() => ({
    over: document.querySelector(".kt-keys").getBoundingClientRect().height,
    card: document.querySelector(".kt-result").getBoundingClientRect().height,
  }));
  expect(heights.card, "the card fits the keyboard's place").toBeLessThanOrEqual(heights.over + 0.5);
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

test("French has its own keyboard, German keeps ä ö ü, and the word is in that language's alphabet", async ({
  page,
}) => {
  const errors = await open(page, "?lang=en");
  await tap(page, '[data-testid="languages"] [data-lang-id="fr"]');
  await expect(page.locator('[data-kt="keys"] .kt-key-row').first().locator(".kt-key").first()).toHaveText("A");
  await expect(page.locator('[data-kt="keys"] .kt-key-row').first().locator(".kt-key").nth(1)).toHaveText("Z");
  await expect.poll(() => page.evaluate(() => window.kotobaState.play.game?.language)).toBe("fr");
  await tap(page, '[data-testid="languages"] [data-lang-id="de"]');
  await expect(page.locator('[data-kt="keys"] .kt-key[data-letter="ü"]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => window.kotobaState.play.game?.language)).toBe("de");
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

test("kana: romaji becomes kana as it is typed, small and marked forms are keys, and the word can be won", async ({
  page,
}) => {
  const errors = await open(page, "?lang=en&seed=3");
  await tap(page, '[data-testid="languages"] [data-lang-id="ja"]');
  await expect(cells(page, 0)).toHaveCount(4);
  await expect.poll(() => page.evaluate(() => window.kotobaState.play.game?.language)).toBe("ja");
  await expect(status(page)).toContainText("4-kana");
  await typeWord(page, "ka");
  await expect(cells(page, 0).first()).toHaveText("か");
  await typeWord(page, "shi");
  await expect(cells(page, 0).nth(1)).toHaveText("し");
  await tap(page, '[data-kt="keys"] [data-act="mark"]');
  await expect(cells(page, 0).nth(1)).toHaveText("じ");
  await tap(page, '[data-kt="keys"] [data-letter="k"]');
  await expect(cells(page, 0).nth(2)).toHaveAttribute("data-pending", "k");
  await tap(page, '[data-kt="keys"] [data-act="back"]');
  await tap(page, '[data-kt="keys"] [data-act="back"]');
  await tap(page, '[data-kt="keys"] [data-act="back"]');
  await expect(cells(page, 0).first()).toHaveText("");
  // A round whose word is known, typed in romaji and sent with Enter, wins.
  await page.evaluate(() => window.kotobaState.play.newGame({ words: "ja", size: 3, hidden: "さくら" }));
  await expect(cells(page, 0)).toHaveCount(3);
  await typeWord(page, "sakura");
  await expect(cells(page, 0).nth(2)).toHaveText("ら");
  await page.keyboard.press("Enter");
  await expect(status(page)).toContainText("Found it in 1!");
  await sound(page, errors);
});

test("a kana guess is marked by the package's own rule", async ({ page }) => {
  await open(page, "?lang=en&seed=3");
  await tap(page, '[data-testid="languages"] [data-lang-id="ja"]');
  await expect.poll(() => page.evaluate(() => window.kotobaState.play.game?.language)).toBe("ja");
  await page.evaluate(() => window.kotobaState.play.newGame({ words: "ja", size: 3, hidden: "さくら" }));
  await expect(cells(page, 0)).toHaveCount(3);
  await typeWord(page, "ikura");
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press("Enter");
  const expected = await page.evaluate(async () => {
    const { markKanaGuess } = await import("/dist/index.js");
    return markKanaGuess([..."いくら"], [..."さくら"]).map((one) => one.mark);
  });
  expect(expected).toEqual(["miss", "hit", "hit"]);
  for (let at = 0; at < expected.length; at += 1)
    await expect(cells(page, 0).nth(at)).toHaveAttribute("data-mark", expected[at]);
});

test("the address names the game: the list, the length, easy words and the seed, and opening it plays the same word", async ({
  page,
}) => {
  const errors = await open(page, "?lang=en&words=fr&size=4&easy=1&seed=7");
  await expect(page.locator('[data-testid="languages"] [aria-pressed="true"]')).toHaveAttribute("data-lang-id", "fr");
  await expect(page.locator('[data-testid="sizes"] [aria-pressed="true"]')).toHaveAttribute("data-size", "4");
  await expect(page.locator('[data-testid="easy"]')).toHaveAttribute("aria-pressed", "true");
  await expect(cells(page, 0)).toHaveCount(4);
  const word = await hidden(page);
  expect(word).toMatch(/^[a-z]{4}$/);
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({
    words: "fr",
    size: "4",
    easy: "1",
    seed: "7",
  });
  // The first word is the seed's; a new word is another one, and the address follows it.
  await tap(page, '[data-testid="new"]');
  await expect.poll(() => new URL(page.url()).searchParams.get("seed")).not.toBe("7");
  await page.goto(`http://kotoba.test/?lang=en&words=fr&size=4&easy=1&seed=7`);
  await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
  expect(await hidden(page)).toBe(word);
  await sound(page, errors);
});

test("Today's word is the day's word of the list, the same as the package gives, and New word leaves it", async ({
  page,
}) => {
  const errors = await open(page, "?lang=en&words=en&size=5&daily=1");
  await expect(page.locator('[data-testid="daily"]')).toHaveAttribute("aria-pressed", "true");
  const word = await hidden(page);
  const expected = await page.evaluate(async () => {
    const { dailyWord, dayKey } = await import("/dist/index.js");
    const { loadWordList } = await import("/dist/load.js");
    return dailyWord((await loadWordList("en", 5)).answers, dayKey(Date.now()), { salt: "en-5-answers" });
  });
  expect(word).toBe(expected);
  await expect(page.locator('[data-testid="credit"]')).toContainText("same for everybody");
  expect(new URL(page.url()).searchParams.get("daily")).toBe("1");
  await tap(page, '[data-testid="new"]');
  await expect(page.locator('[data-testid="daily"]')).toHaveAttribute("aria-pressed", "false");
  expect(new URL(page.url()).searchParams.get("daily")).toBeNull();
  await sound(page, errors);
});

test("Using it: the code and the command are the game's own, and the code puts the same game on a page", async ({
  page,
}) => {
  const errors = await open(page, "?lang=en&words=en&size=5&seed=3");
  const code = page.locator('[data-testid="using-code"]');
  await expect(code).toContainText(
    'mountKotoba(document.getElementById("game"), { words: "en", size: 5, seed: 3, locale: "en" });',
  );
  await expect(page.locator('[data-testid="cli-code"]')).toHaveText("npx @johnmorrisdotca/kotoba lists --words en");
  await expect(page.locator('[data-testid="counts"]')).toContainText("easy answers, inside");
  // The code, run against the package this page was built from, mounts a game with the same hidden word.
  const same = await page.evaluate(async () => {
    const { mountKotoba } = await import("/dist/play.js");
    const holder = document.createElement("div");
    document.body.append(holder);
    const source = document
      .querySelector('[data-testid="using-code"]')
      .textContent.replace(/^import .*$/m, "")
      .split("\n")
      .filter((line) => !line.includes("newGame"))
      .join("\n");
    const run = new Function(
      "mountKotoba",
      "document",
      `return (async () => { ${source.replace("await play.ready;", "await play.ready;")}\n return play; })();`,
    );
    const play = await run(mountKotoba, { getElementById: () => holder });
    const mine = play.game.hidden;
    play.destroy();
    return { mine, shown: window.kotobaState.hidden, boards: document.querySelectorAll("[data-kotoba]").length };
  });
  expect(same.mine).toBe(same.shown);
  expect(same.boards).toBe(1);
  for (const id of ["copy-link", "copy-code"]) {
    await tap(page, `[data-testid="${id}"]`);
    await expect(page.locator(`[data-testid="${id}"]`)).toHaveText(/Copied|Copy it by hand/);
  }
  await sound(page, errors);
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
  await expect(page.locator("h1")).toHaveText("Kotoba API: every export");
  expect(await page.locator("article[id]").count()).toBeGreaterThan(30);
  await expect(page.locator(".docs-crumbs a")).toHaveAttribute("href", "docs/index.html");
  await page.locator(".docs-crumbs a").click();
  await page.getByRole("link", { name: "Demo", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
  await sound(page, errors);
});

// The Help switch in the family header (scripts/family-template.mjs): off, the page is as it was; on, every
// option row says in one line what it does, in the page's language, and every control in it has hover words.
test("Help is off at first, and on it shows a line under each option row, in either language, without resizing the play area", async ({
  page,
}) => {
  const errors = await open(page);
  const lines = page.locator(".fam-help");
  const rows = page.locator("[data-help-en]");
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(page.locator("[data-help-switch]")).toHaveAttribute("aria-pressed", "false");
  await expect(lines.first()).toBeHidden();
  const surface = page.locator('[data-kt="grid"]').first();
  const before = await surface.boundingBox();
  await page.locator("[data-help-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("data-help", "on");
  for (const row of await rows.all()) {
    // A row in a tab that is not showing has its line, and shows it when the tab opens.
    if (await row.isVisible()) {
      const shown = await row.evaluate((el) => {
        const line =
          el.classList.contains("fam-seg") || el.hasAttribute("data-help-after")
            ? el.nextElementSibling
            : el.querySelector(":scope > .fam-help");
        return (
          line?.classList.contains("fam-help") &&
          window.getComputedStyle(line).display !== "none" &&
          line.textContent.length > 10
        );
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
  const untitled = await page.evaluate(() =>
    [...document.querySelectorAll("[data-help-en] button")].filter((b) => !b.title).map((b) => b.textContent.trim()),
  );
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

test("the word chain answers a word, refuses a wrong one, and says where the words come from", async ({ page }) => {
  const errors = await open(page);
  await page.getByTestId("chain").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("chain-list").locator("li")).toHaveCount(1);
  await expect(page.getByTestId("phrases-credit")).toContainText("JMdict");
  const before = await page.locator("#board").textContent();

  // Typing in the box is not typing into the game above it.
  await page.getByTestId("chain-input").fill("zzz");
  await tap(page, page.getByTestId("chain-say"));
  await expect(page.getByTestId("chain-status")).not.toHaveText("");
  expect(await page.locator("#board").textContent()).toBe(before);
  await expect(page.getByTestId("chain-list").locator("li")).toHaveCount(1);

  // A word from the list that starts where the chain stands: the computer answers it.
  const said = await page.evaluate(async () => {
    const { JA_SHIRITORI } = await import("./dist/lists/shiritori-ja.data.js");
    const { readShiritoriWords, shiritoriChoices } = await import("./dist/index.js");
    const words = readShiritoriWords(JA_SHIRITORI);
    const shown =
      document.querySelector("#chain-list li .phrase-head span")?.textContent ??
      document.querySelector("#chain-list li .phrase-head")?.textContent;
    return shiritoriChoices(words, [shown])[0].reading;
  });
  await page.getByTestId("chain-input").fill(said);
  await tap(page, page.getByTestId("chain-say"));
  await expect(page.getByTestId("chain-list").locator("li")).toHaveCount(3);
  await tap(page, page.getByTestId("chain-new"));
  await expect(page.getByTestId("chain-list").locator("li")).toHaveCount(1);
  await sound(page, errors);
});

test("the idioms can be searched by what they mean, and say whose judgement put them there", async ({ page }) => {
  const errors = await open(page);
  await page.getByTestId("idioms").scrollIntoViewIfNeeded();
  await page.getByTestId("idiom-search").fill("laurels");
  await expect(page.getByTestId("idiom-list")).toContainText("胡坐をかく");
  await expect(page.getByTestId("idiom-list")).toContainText("JMdict");
  await expect(page.getByTestId("idiom-count")).not.toHaveText("");
  await page.getByTestId("idiom-search").fill("no such phrase anywhere");
  await expect(page.getByTestId("idiom-list").locator("li")).toHaveCount(0);
  await tap(page, page.getByTestId("idiom-another"));
  await expect(page.getByTestId("idiom-list").locator("li")).toHaveCount(1);
  await sound(page, errors);
});

test("every key is whole on the felt at a phone's width", async ({ page }) => {
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await open(page, "?lang=en&seed=3");
    const past = await page.evaluate(() => {
      const felt = document.querySelector(".fam-felt.game").getBoundingClientRect();
      return [...document.querySelectorAll('[data-kt="keys"] button')]
        .filter((key) => {
          const box = key.getBoundingClientRect();
          return box.left < felt.left || box.right > felt.right;
        })
        .map((key) => key.textContent);
    });
    expect(past, `the keys past the felt at ${width}`).toEqual([]);
  }
});

test("the colour guide opens and closes by mouse, touch and keyboard, and Escape leaves it", async ({ page }) => {
  const errors = await open(page, "?lang=en&seed=3");
  const button = page.locator('[data-kt="guide-open"]');
  const guide = page.locator('[data-kt="guide"]');
  await expect(button).toHaveText(/Colour guide/);
  await expect(guide).not.toBeVisible();
  await tap(page, button);
  await expect(guide).toBeVisible();
  for (const name of ["Green", "Orange", "Grey"]) await expect(guide).toContainText(name);
  await expect(guide.locator("li .kt-cell")).toHaveCount(3);
  // Typing while it is open does not reach the game.
  await page.keyboard.press("c");
  await page.keyboard.press("Escape");
  await expect(guide).not.toBeVisible();
  await expect(cells(page, 0).first()).toHaveText("");
  await expect(button).toBeFocused();
  await tap(page, button);
  await tap(page, '[data-kt="guide-close"]');
  await expect(guide).not.toBeVisible();
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(guide).toBeVisible();
  await tap(page, '[data-kt="guide-done"]');
  await expect(guide).not.toBeVisible();
  await sound(page, errors);
});

test("the kana guide adds yellow and the arrows, and kana marks show both arrows at once", async ({ page }) => {
  const errors = await open(page, "?lang=en&seed=3");
  await tap(page, '[data-testid="languages"] [data-lang-id="ja"]');
  await expect.poll(() => page.evaluate(() => window.kotobaState.play.game?.language)).toBe("ja");
  await tap(page, '[data-kt="guide-open"]');
  const guide = page.locator('[data-kt="guide"]');
  for (const name of ["Yellow", "Arrow down", "Arrow up", "Both arrows"]) await expect(guide).toContainText(name);
  await expect(guide.locator("li .kt-cell")).toHaveCount(7);
  await expect(guide.locator('.kt-cell[data-size="wrong"][data-tone="wrong"]')).toHaveCount(1);
  await page.keyboard.press("Escape");
  await sound(page, errors);
});

// ---- What a guess means: the host's `meanings` function, drawn in the status line and on the end card ----

/** Hand the page a stand-in `meanings` function of its own, before it loads: `null` for no function at all. Every word it is asked is kept in `window.kotobaAsked`. */
async function withMeanings(page, how) {
  await page.addInitScript((mode) => {
    window.kotobaAsked = [];
    if (mode === "none") window.kotobaTestMeanings = false;
    else
      window.kotobaTestMeanings = async (word) => {
        window.kotobaAsked.push(word);
        if (mode === "fails") throw new Error("the dictionary is down");
        if (mode === "slow") await new Promise((done) => setTimeout(done, 400));
        // A word with no meaning shows nothing; the longest line a meaning may be is sixty characters.
        if (word === "plant" || word === "かみ") return null;
        return mode === "long"
          ? `the meaning of ${word}, which is as long as a line may be ok`.slice(0, 60)
          : `meaning of ${word}`;
      };
  }, how);
}

const rowOf = (page, row) => page.locator('[data-kt="grid"] .kt-row').nth(row);
const boardBox = (page) =>
  page.evaluate(() => {
    const box = (selector) => {
      const { width, height } = document.querySelector(selector).getBoundingClientRect();
      return `${Math.round(width)}×${Math.round(height * 10) / 10}`;
    };
    // The status line is as wide as its words; what must not change is every height and the width of the rest.
    const high = (selector) => Math.round(document.querySelector(selector).getBoundingClientRect().height * 10) / 10;
    return `${[".kt-root", ".kt-grid", ".kt-keys"].map(box).join(" ")} status ${high(".kt-status")}`;
  });
/** Guess a word that is not the hidden one, sending it with the keys. */
async function guess(page, word) {
  await typeWord(page, word);
  await tap(page, '[data-kt="keys"] [data-act="enter"]');
}

test("tapping a guess says what its word means in the status line, and nothing moves", async ({ page }) => {
  await withMeanings(page, "ok");
  const errors = await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  const [first, second] = ["crane", "stone"].filter((word) => word !== secret);
  await guess(page, first);
  await guess(page, second);
  const before = await boardBox(page);
  const prompt = await status(page).textContent();
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toContainText(`${first.toUpperCase()}: meaning of ${first}`);
  // It is the status line's own live region that says it, so a screen reader hears it.
  await expect(status(page)).toHaveAttribute("role", "status");
  expect(await boardBox(page), "nothing changes size").toBe(before);
  // Another guess: its own meaning replaces the first.
  await tap(page, rowOf(page, 1));
  await expect(status(page)).toContainText(`${second.toUpperCase()}: meaning of ${second}`);
  expect(await boardBox(page)).toBe(before);
  // A press anywhere else puts the line back.
  await tap(page, "h1");
  await expect(status(page)).toHaveText(prompt);
  expect(await boardBox(page)).toBe(before);
  await sound(page, errors);
});

test("a tap on a guess does not type, and what is typed after it still lands", async ({ page }) => {
  await withMeanings(page, "ok");
  const errors = await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  await guess(
    page,
    ["crane", "stone"].find((word) => word !== secret),
  );
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toContainText("meaning of");
  // The tap typed nothing and kept the focus where it was: not on the row.
  await expect(cells(page, 1).first()).toHaveText("");
  expect(await page.evaluate(() => document.activeElement?.closest?.(".kt-row[data-guess]") ?? null)).toBeNull();
  // The device's keyboard types straight away, and the meaning gives way to the game (a mouse left over the row would show it again).
  await page.mouse.move(2, 2);
  await page.keyboard.type("ab");
  await expect(cells(page, 1).nth(0)).toHaveText("A");
  await expect(cells(page, 1).nth(1)).toHaveText("B");
  await expect(status(page)).not.toContainText("meaning of");
  // So do the keys on the screen.
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toContainText("meaning of");
  await tap(page, key(page, "c"));
  await page.mouse.move(2, 2);
  await expect(cells(page, 1).nth(2)).toHaveText("C");
  await expect(status(page)).not.toContainText("meaning of");
  await sound(page, errors);
});

test("a guess can be focused with the keyboard, says what it means, and does not take typing away", async ({
  page,
}) => {
  await withMeanings(page, "ok");
  const errors = await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  const word = ["crane", "stone"].find((one) => one !== secret);
  await guess(page, word);
  const row = rowOf(page, 0);
  await expect(row).toHaveAttribute("tabindex", "0");
  await row.focus();
  await expect(status(page)).toContainText(`meaning of ${word}`);
  // Escape puts the line back without leaving the row; typing goes to the game from the row.
  await page.keyboard.press("Escape");
  await expect(status(page)).not.toContainText("meaning of");
  await page.keyboard.type("a");
  await expect(cells(page, 1).first()).toHaveText("A");
  // The empty rows and the row being typed are not for looking at.
  await expect(rowOf(page, 1)).not.toHaveAttribute("tabindex", "0");
  await expect(rowOf(page, 5)).not.toHaveAttribute("tabindex", "0");
  await sound(page, errors);
});

test("a mouse shows the meaning while it is over a guess", async ({ page }) => {
  test.skip(test.info().project.use.hasTouch === true, "a mouse is the desk's");
  await withMeanings(page, "ok");
  await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  const word = ["crane", "stone"].find((one) => one !== secret);
  await guess(page, word);
  const prompt = await status(page).textContent();
  await rowOf(page, 0).hover();
  await expect(status(page)).toContainText(`meaning of ${word}`);
  await page.mouse.move(2, 2);
  await expect(status(page)).toHaveText(prompt);
});

test("a word with no meaning shows nothing, and a failing source stays silent", async ({ page }) => {
  await withMeanings(page, "ok");
  const errors = await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  test.skip(secret === "plant", "the word is the one with no meaning");
  await guess(page, "plant");
  const prompt = await status(page).textContent();
  const before = await boardBox(page);
  await tap(page, rowOf(page, 0));
  await expect.poll(() => page.evaluate(() => window.kotobaAsked)).toContain("plant");
  await expect(status(page)).toHaveText(prompt);
  expect(await boardBox(page)).toBe(before);
  await expect(page.locator('[data-kt="meaning"]')).toHaveCount(0);
  await sound(page, errors);
});

test("a source that fails is silent: no line, no error on the page", async ({ page }) => {
  await withMeanings(page, "fails");
  const errors = await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  await guess(
    page,
    ["crane", "stone"].find((word) => word !== secret),
  );
  const prompt = await status(page).textContent();
  await tap(page, rowOf(page, 0));
  await expect.poll(() => page.evaluate(() => window.kotobaAsked.length)).toBeGreaterThan(0);
  await expect(status(page)).toHaveText(prompt);
  await expect(page.locator('[data-kt="meaning"]')).toHaveCount(0);
  await sound(page, errors);
});

test("the first time may take a moment: nothing shows until the meaning arrives, then it does", async ({ page }) => {
  await withMeanings(page, "slow");
  await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  const word = ["crane", "stone"].find((one) => one !== secret);
  await guess(page, word);
  const prompt = await status(page).textContent();
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toHaveText(prompt);
  await expect(status(page)).toContainText(`meaning of ${word}`);
});

test("the hidden word's meaning is never asked for or shown before the round ends, and is on the end card after", async ({
  page,
}) => {
  await withMeanings(page, "ok");
  const errors = await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  const tries = ["crane", "stone", "light", "sweet", "train", "house"].filter((word) => word !== secret).slice(0, 6);
  for (let row = 0; row < 5; row += 1) {
    await guess(page, tries[row]);
    await tap(page, rowOf(page, row));
    await expect(status(page)).toContainText(`meaning of ${tries[row]}`);
    expect(await page.evaluate(() => window.kotobaAsked), "the hidden word is not asked about").not.toContain(secret);
    await expect(page.locator('[data-kt="result"]')).toHaveCount(0);
  }
  await guess(page, tries[5]);
  const card = page.locator('[data-kt="result"]');
  await expect(card).toHaveAttribute("data-result", "lost");
  await expect(card.locator('[data-kt="meaning"]')).toHaveText(`meaning of ${secret}`);
  expect(await page.evaluate(() => window.kotobaAsked)).toContain(secret);
  // The score stays, and the card still fits the keyboard's place.
  await expect(card).toContainText("points");
  const fit = await page.evaluate(() => {
    const card = document.querySelector(".kt-result");
    return {
      card: card.getBoundingClientRect().height,
      keys: document.querySelector(".kt-keys").getBoundingClientRect().height,
      overflow: card.scrollHeight - card.clientHeight,
    };
  });
  expect(fit.card).toBeLessThanOrEqual(fit.keys + 0.5);
  expect(fit.overflow).toBeLessThanOrEqual(1);
  // A guess can still be tapped after the round, and says what it means on the line.
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toContainText(`meaning of ${tries[0]}`);
  await sound(page, errors);
});

test("a won round shows the meaning on the card too, and the longest meaning still fits at every length", async ({
  page,
}) => {
  await withMeanings(page, "long");
  const errors = await open(page, "?lang=en&seed=3");
  for (const [size, hiddenWord] of [
    [4, "bake"],
    [5, "crane"],
    [6, "garden"],
  ]) {
    await page.evaluate(
      ([size, word]) => window.kotobaState.play.newGame({ words: "en", size, hidden: word }),
      [size, hiddenWord],
    );
    await expect(cells(page, 0)).toHaveCount(size);
    await typeWord(page, hiddenWord);
    await tap(page, '[data-kt="keys"] [data-act="enter"]');
    const card = page.locator('[data-kt="result"]');
    await expect(card).toHaveAttribute("data-result", "won");
    await expect(card.locator('[data-kt="meaning"]')).toContainText(`the meaning of ${hiddenWord}`);
    const fit = await page.evaluate(() => {
      const card = document.querySelector(".kt-result");
      const parts = [...card.children].map((part) => part.getBoundingClientRect());
      return {
        card: card.getBoundingClientRect().height,
        keys: document.querySelector(".kt-keys").getBoundingClientRect().height,
        overflow: card.scrollHeight - card.clientHeight,
        wide: Math.max(...parts.map((part) => part.right)) - card.getBoundingClientRect().right,
      };
    });
    expect(fit.card, `${size} letters: the card fits the keyboard's place`).toBeLessThanOrEqual(fit.keys + 0.5);
    expect(fit.overflow, `${size} letters: nothing runs out of the card`).toBeLessThanOrEqual(1);
    expect(fit.wide).toBeLessThanOrEqual(1);
    const tile = await card.locator(".kt-result-tile").first().boundingBox();
    expect(tile.height, "the word is still large").toBeGreaterThanOrEqual(34);
  }
  await sound(page, errors);
});

test("kana: a guess says what it means, and the card does too", async ({ page }) => {
  await withMeanings(page, "ok");
  const errors = await open(page, "?lang=en&seed=3");
  await tap(page, '[data-testid="languages"] [data-lang-id="ja"]');
  await expect.poll(() => page.evaluate(() => window.kotobaState.play.game?.language)).toBe("ja");
  await page.evaluate(() => window.kotobaState.play.newGame({ words: "ja", size: 3, hidden: "さくら" }));
  await expect(cells(page, 0)).toHaveCount(3);
  await typeWord(page, "ikura");
  await page.keyboard.press("Enter");
  const before = await boardBox(page);
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toContainText("いくら: meaning of いくら");
  expect(await boardBox(page)).toBe(before);
  await typeWord(page, "sakura");
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-kt="result"] [data-kt="meaning"]')).toHaveText("meaning of さくら");
  const fit = await page.evaluate(() => {
    const card = document.querySelector(".kt-result");
    return {
      card: card.getBoundingClientRect().height,
      keys: document.querySelector(".kt-keys").getBoundingClientRect().height,
    };
  });
  expect(fit.card).toBeLessThanOrEqual(fit.keys + 0.5);
  await sound(page, errors);
});

test("in Japanese the guide says guesses can be tapped", async ({ page }) => {
  await withMeanings(page, "ok");
  const errors = await open(page, "?lang=ja&seed=3");
  const secret = await hidden(page);
  const word = ["crane", "stone"].find((one) => one !== secret);
  await guess(page, word);
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toContainText(`${word.toUpperCase()}: meaning of ${word}`);
  await tap(page, '[data-kt="guide-open"]');
  await expect(page.locator('[data-kt="guide"] .kt-guide-tap')).toHaveText(
    "予想した行をタップすると、その単語の意味が見られます。",
  );
  await page.keyboard.press("Escape");
  await sound(page, errors);
});

test("the colour guide says a guess can be tapped, only where the game has meanings", async ({ page }) => {
  await withMeanings(page, "ok");
  const errors = await open(page, "?lang=en&seed=3");
  await tap(page, '[data-kt="guide-open"]');
  await expect(page.locator('[data-kt="guide"] .kt-guide-tap')).toHaveText("Tap a guess to see what its word means.");
  await page.keyboard.press("Escape");
  await sound(page, errors);
});

test("with no meanings function nothing is added: no focusable guess, no line in the guide, no tap that does anything", async ({
  page,
}) => {
  await withMeanings(page, "none");
  const errors = await open(page, "?lang=en&seed=3");
  const secret = await hidden(page);
  await guess(
    page,
    ["crane", "stone"].find((word) => word !== secret),
  );
  await expect(page.locator('[data-kt="grid"] [tabindex]')).toHaveCount(0);
  await expect(page.locator('[data-kt="grid"] [data-guess]')).toHaveCount(0);
  const prompt = await status(page).textContent();
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toHaveText(prompt);
  await tap(page, '[data-kt="guide-open"]');
  await expect(page.locator('[data-kt="guide"] .kt-guide-tap')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await sound(page, errors);
});

test("a real kana guess shows what Jisho says it means, from one small piece of the dictionary and none of the files for words that are not for children", async ({
  page,
}) => {
  const errors = await open(page, "?lang=en&seed=3");
  const fetched = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith("/jisho/")) fetched.push(pathname);
  });
  await tap(page, '[data-testid="languages"] [data-lang-id="ja"]');
  await expect.poll(() => page.evaluate(() => window.kotobaState.play.game?.language)).toBe("ja");
  await page.evaluate(() => window.kotobaState.play.newGame({ words: "ja", size: 4, hidden: "かんぱい" }));
  await expect(cells(page, 0)).toHaveCount(4);
  // Nothing of Jisho is fetched until a meaning is asked for.
  expect(fetched).toEqual([]);
  await typeWord(page, "koufuku");
  await tap(page, '[data-kt="keys"] [data-act="enter"]');
  const before = await boardBox(page);
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toContainText("こうふく: 幸福 happiness");
  await expect(status(page)).toContainText("降伏 surrender");
  const line = await page.locator('[data-kt="meaning"]').textContent();
  expect([...line.replace(/^[^:]*: /, "")].length, "about sixty characters at most").toBeLessThanOrEqual(60);
  expect(await boardBox(page)).toBe(before);
  // One small piece of the dictionary, its table of contents and the entry: not the index of written forms, nor the words that are not for children.
  const pieces = fetched.filter((path) => /\/data\/words\/r\d+\.data\.js$/.test(path));
  expect(pieces, "one piece of the readings").toHaveLength(1);
  expect(
    fetched.filter((path) => /extra|common|\/f\d+\.data/.test(path)),
    "none of the files for everything else",
  ).toEqual([]);
  expect(fetched.length, `${fetched.join(" ")}`).toBeLessThanOrEqual(3);
  // The same word again asks nobody.
  await tap(page, "h1");
  await tap(page, rowOf(page, 0));
  await expect(status(page)).toContainText("幸福 happiness");
  expect(fetched.filter((path) => /\/r\d+\.data/.test(path))).toHaveLength(1);
  const piece = await page.evaluate(async (path) => (await fetch(path)).text().then((text) => text.length), pieces[0]);
  expect(piece, "a piece is a few hundred kilobytes at most").toBeLessThan(400_000);
  // The word that was hidden has its meaning on the card, once the round is over.
  await typeWord(page, "kanpai");
  await tap(page, '[data-kt="keys"] [data-act="enter"]');
  await expect(page.locator('[data-kt="result"] [data-kt="meaning"]')).toContainText("完敗 utter defeat · 乾杯 cheers");
  await sound(page, errors);
});
