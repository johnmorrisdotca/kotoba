// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and is the same each run: the hidden word
// comes from a seed (`?seed=`), the guesses are chosen by a fixed rule from the package's own lists, and motion is reduced.
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const GAME = '[data-testid="game"]';

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


/** Open the demo with a test hook, wait for the round to be dealt, and make the guesses. */
const play = (rows, kana = false) => async (page) => {
  await page.waitForFunction(() => window.kotobaState?.play.game !== null && window.kotobaState?.hidden);
  await guess(page, rows, kana);
};
const init = () => { window.kotobaTest = true; };
const address = (words, size, lang = "en") => `/?lang=${lang}&words=${words}&size=${size}&seed=2026`;

/** One board, cropped to the board. */
const board = (subject, words, size, rows, kana = false) => ({ subject, views: ["desk"], scale: 1, url: address(words, size, kana ? "ja" : "en"), init, ready: `${GAME} .kt-row`, target: GAME, prepare: play(rows, kana) });

await takePictures({
  shots: [
    // The page from the top, on a desk: English, five letters, four guesses in. On a phone, in Japanese kana, scrolled to the board.
    {
      subject: "hero",
      views: ["desk", "phone"],
      height: 900,
      init,
      url: address("en", 5),
      ready: `${GAME} .kt-row`,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto(`http://kotoba.test${address("ja", 4, "ja")}`);
          await play(3, true)(page);
          await page.locator(GAME).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
        } else {
          await play(4)(page);
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      },
    },
    board("english", "en", 5, 4),
    board("french", "fr", 5, 3),
    board("german", "de", 5, 3),
    board("kana", "ja", 4, 3, true),
    board("six-letters", "en", 6, 3),
    board("four-letters", "en", 4, 2),
  ],
});
