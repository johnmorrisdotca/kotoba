import { describe, expect, it } from "vitest";

import { KOTOBA_STRINGS, kotobaLanguage, kotobaSay } from "./strings.ts";

const places = (text: string) => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]))].sort();

/** The strings that read the same in both languages: a language's own name for itself, a key's face, a line that is only its places to fill in. */
const SAME = new Set(["listEn", "listFr", "listDe", "listJa", "small", "mark", "cliDaily"]);

describe("the strings", () => {
  it("have a Japanese line for every English one, in the same order, keeping every place to fill in", () => {
    expect(Object.keys(KOTOBA_STRINGS.ja)).toEqual(Object.keys(KOTOBA_STRINGS.en));
    for (const key of Object.keys(KOTOBA_STRINGS.en) as (keyof typeof KOTOBA_STRINGS.en)[]) {
      expect(places(KOTOBA_STRINGS.ja[key]), key).toEqual(places(KOTOBA_STRINGS.en[key]));
      expect(KOTOBA_STRINGS.ja[key].trim(), key).not.toBe("");
      if (!SAME.has(key)) expect(KOTOBA_STRINGS.ja[key], key).not.toBe(KOTOBA_STRINGS.en[key]);
    }
  });

  it("the two helps list the same options and the same commands, in the same order", () => {
    const options = (text: string) => [...text.matchAll(/^\s+(?:-\w, )?(--[\w-]+)/gm)].map((match) => match[1]);
    expect(options(KOTOBA_STRINGS.ja.cliUsage)).toEqual(options(KOTOBA_STRINGS.en.cliUsage));
    const commands = (text: string) => text.split("\n").filter((line) => line.startsWith("  kotoba ")).map((line) => /^ {2}kotoba \w+( --\w+)?/.exec(line)?.[0]);
    expect(commands(KOTOBA_STRINGS.ja.cliUsage)).toEqual(commands(KOTOBA_STRINGS.en.cliUsage));
  });

  it("have a header for the lists table with five columns in both languages", () => {
    expect(KOTOBA_STRINGS.en.cliListsHead.split(",")).toHaveLength(5);
    expect(KOTOBA_STRINGS.ja.cliListsHead.split(",")).toHaveLength(5);
  });

  it("fill in the braces they are given, and leave the rest", () => {
    expect(kotobaSay("{n} letters", { n: 5 })).toBe("5 letters");
    expect(kotobaSay("Found it in {n}! {score} points.", { n: 3 })).toBe("Found it in 3! {score} points.");
    expect(kotobaSay(KOTOBA_STRINGS.ja.won, { n: 2, score: 410 })).toBe("2回で正解！ 410点。");
  });

  it("choose Japanese for a tag that begins ja, and English for anything else", () => {
    expect(kotobaLanguage("ja")).toBe("ja");
    expect(kotobaLanguage("ja_JP.UTF-8")).toBe("ja");
    expect(kotobaLanguage("fr")).toBe("en");
    expect(kotobaLanguage(undefined)).toBe("en");
  });
});
