import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { firstSenseNotForEveryone, keepGuessable, readAllowed } from "../scripts/kana-keep.mjs";
import { loadWordList } from "./load.ts";

/**
 * NO WORD LEAVES THE KANA LISTS BY ACCIDENT. A game somebody played, kept or half way through, was checked against
 * the lists as they were, so a word that may be guessed stays so (scripts/kana-keep.mjs): the build keeps the lists it
 * is run over, and the one way out is the bar on what is not for a child (scripts/kana-barred.json, written beside
 * the lists with the English of each word so a person can read it).
 */
const LENGTHS = [3, 4, 5];
const barred = JSON.parse(readFileSync(new URL("../scripts/kana-barred.json", import.meta.url), "utf8"));

/** The least each list may hold: what it held when the lists were last made, so a build that drops words fails here. A list that grows raises it. */
const FLOOR = { 3: 16296, 4: 38647, 5: 35155 };
/** Words JMdict's release of 2026-11 stopped listing, which a game may have used: they stay. */
const GONE_FROM_JMDICT = { 3: ["やまま"], 5: ["ふかいきり", "うまふぶき"] };

describe("the words that may be guessed stay so", () => {
  it("keeps what was there and what JMdict lists now, less the barred, and nothing else leaves", () => {
    const before = new Set(["あいう", "かきく", "やまま", "ほもび"]);
    const fresh = new Set(["あいう", "さしす", "ほもび", "たちつ"]);
    expect([...keepGuessable({ before, fresh, barred: new Set(["ほもび"]) })].sort()).toEqual(
      ["あいう", "かきく", "さしす", "たちつ", "やまま"].sort(),
    );
    expect(keepGuessable({ before, fresh: new Set(), barred: new Set() })).toEqual(before);
    for (const word of before)
      expect(keepGuessable({ before, fresh: new Set(), barred: new Set() }).has(word)).toBe(true);
  });

  it("reads back from a list file the words it was written with", () => {
    const text = `\n  alphabet: "あいう",\n  codes: "!#$",\n  allowed: "!#$$#!",\n`;
    expect([...readAllowed(text, 3)].sort()).toEqual(["あいう", "ういあ"].sort());
  });

  it.each(LENGTHS)("holds at least %i-kana's floor, and every answer is a word that may be guessed", async (length) => {
    const list = await loadWordList("ja", length);
    expect(list.allowed.size).toBeGreaterThanOrEqual(FLOOR[length]);
    const allowed = list.allowed;
    for (const word of list.answers) expect(allowed.has(word), word).toBe(true);
    for (const word of list.easy) expect(new Set(list.answers).has(word), word).toBe(true);
  });

  it.each(LENGTHS)("keeps every word JMdict has stopped listing, at %i kana", async (length) => {
    const list = await loadWordList("ja", length);
    const allowed = list.allowed;
    for (const word of GONE_FROM_JMDICT[length] ?? []) expect(allowed.has(word), word).toBe(true);
  });
});

describe("the bar on what is not for a child", () => {
  it("is a reading every entry of which has a vulgar, X-rated, sensitive or derogatory first sense, or a first-sense gloss that names sex or the sex trade", () => {
    const entry = (misc) =>
      `<entry><sense><misc>&${misc};</misc><gloss>a</gloss></sense><sense><gloss>b</gloss></sense></entry>`;
    for (const mark of ["vulg", "X", "sens", "derog"]) expect(firstSenseNotForEveryone(entry(mark))).toBe(true);
    expect(firstSenseNotForEveryone(entry("col"))).toBe(false);
    expect(firstSenseNotForEveryone("<entry><sense><gloss>prostitution</gloss></sense></entry>")).toBe(true);
    expect(
      firstSenseNotForEveryone(
        "<entry><sense><gloss>a</gloss></sense><sense><misc>&vulg;</misc><gloss>b</gloss></sense></entry>",
      ),
    ).toBe(false);
  });

  it.each(LENGTHS)("leaves no barred word in the %i-kana lists, answers or guesses", async (length) => {
    const list = await loadWordList("ja", length);
    const guessable = new Set([...list.allowed, ...list.answers, ...list.easy]);
    const words = Object.keys(barred[length]);
    expect(words.length).toBeGreaterThan(0);
    for (const word of words) expect(guessable.has(word), word).toBe(false);
  });

  it("bars the words the release of 2026-11 would have joined that are not for a child", async () => {
    const all = (await Promise.all(LENGTHS.map((length) => loadWordList("ja", length)))).flatMap((list) => [
      ...list.allowed,
    ]);
    for (const word of ["ほもび", "ほもびでお", "じょそこ", "ひどうてい"]) expect(all.includes(word), word).toBe(false);
  });
});
