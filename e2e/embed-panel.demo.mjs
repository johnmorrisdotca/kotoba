// The demo's "Put it in your page" is kazoku-ui's <kazoku-embed-panel>: its tabs, sizes and picker are all there, the code follows the game's choices, and the picture is the code running.
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
const P = '[data-testid="embed-panel"]';

const open = async (page, query = "?words=en&size=5&seed=3") => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.route("http://kotoba.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({
      body: readFileSync(file),
      contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream",
    });
  });
  await page.addInitScript(() => {
    window.kotobaTest = true;
  });
  await page.goto(`http://kotoba.test/${query}`);
  await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
  await page.locator(`${P} [part="copy"]`).scrollIntoViewIfNeeded();
  await expect(page.locator(`${P} [part="copy"]`)).toBeVisible();
  return errors;
};
const code = (page) => page.locator(`${P} [part="code"]`);

test("the panel holds the family's seven tabs and its own, three sizes, a picker of every list and length, Copy and the two links", async ({
  page,
}) => {
  const errors = await open(page);
  await expect(page.locator(`${P} [role="tab"]`)).toHaveText([
    "HTML",
    "ES module",
    "React",
    "Vue",
    "Angular",
    "Svelte",
    "iframe",
    "mountKotoba",
  ]);
  await expect(page.locator(`${P} [part="size-button"]`)).toHaveText(["320", "480", "640"]);
  await expect(page.locator(`${P} [part="size-button"][aria-pressed="true"]`)).toHaveText("480");
  await expect(page.locator('[data-testid="embed-lists"] button')).toHaveText([
    "English",
    "Français",
    "Deutsch",
    "かな",
  ]);
  await expect(page.locator('[data-testid="embed-letters"] button')).toHaveCount(3);
  await expect(page.locator(`${P} [part="copy"]`)).toHaveText(/Copy/);
  await expect(page.locator(`${P} [part="open"]`)).toBeVisible();
  await expect(page.locator(`${P} [part="docs"]`)).toBeVisible();
  await expect(page.locator(`${P} kotoba-game`)).toBeVisible();
  expect(errors).toEqual([]);
});

test("the code follows the list, the length, easy and today's word, and 480 is left out of it", async ({ page }) => {
  await open(page);
  await expect(code(page)).toContainText('<kotoba-game words="en" letters="5"></kotoba-game>');
  await expect(code(page)).not.toContainText("size=");
  await page.locator('[data-testid="embed-lists"] button[data-id="de"]').click();
  await expect(code(page)).toContainText('words="de"');
  await page.locator('[data-testid="embed-letters"] button[data-id="6"]').click();
  await expect(code(page)).toContainText('letters="6"');
  await page.locator('[data-testid="embed-easy"]').click();
  await expect(code(page)).toContainText("easy");
  await page.locator('[data-testid="embed-daily"]').click();
  await expect(code(page)).toContainText('daily="today"');
  await page.locator(`${P} button[data-size="320"]`).click();
  await expect(code(page)).toContainText('size="small"');
  await expect(page.locator(`${P} kotoba-game`)).toHaveAttribute("words", "de");
  await page.locator(`${P} button[data-kind="iframe"]`).click();
  await expect(code(page)).toContainText(
    "/kotoba/embed/?words=de&amp;letters=6&amp;easy=on&amp;daily=today&amp;size=small",
  );
  await page.locator(`${P} button[data-kind="react"]`).click();
  await expect(code(page)).toContainText("@johnmorrisdotca/kotoba/element/define");
  await page.locator('[data-testid="embed-lists"] button[data-id="ja"]').click();
  await expect(page.locator('[data-testid="embed-letters"] button')).toHaveText(["3 kana", "4 kana", "5 kana"]);
});

test("the code follows the game on the table", async ({ page }) => {
  await open(page);
  await page.locator('[data-testid="languages"] [data-lang-id="fr"]').click();
  await expect(code(page)).toContainText('words="fr"');
  await page.locator('[data-testid="sizes"] button[data-size="6"]').click();
  await expect(code(page)).toContainText('letters="6"');
});

test("the panel and its words follow the page's language", async ({ page }) => {
  await open(page);
  await page.locator('kazoku-language-picker [data-v="ja"]').click();
  await expect(page.locator('[data-testid="embed-easy"]')).toHaveText("やさしい単語");
  await expect(page.locator(`${P} [part="copy"]`)).toHaveText(/コピー/);
  await page.locator('kazoku-language-picker [data-v="en"]').click();
  await expect(page.locator('[data-testid="embed-easy"]')).toHaveText("Easy words");
});

test("every control is a finger wide and the page does not scroll sideways", async ({ page }) => {
  await open(page);
  const small = await page.locator(`${P} button:not(kotoba-game *), ${P} input`).evaluateAll((all) =>
    all
      .filter((element) => element.getBoundingClientRect().width > 0)
      .map((element) => ({ name: element.textContent.trim(), height: element.getBoundingClientRect().height }))
      .filter((one) => one.height < 47.5),
  );
  expect(small).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
