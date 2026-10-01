import { describe, expect, it } from "vitest";

import { runCli } from "./cli.ts";
import { WORD_LIST_SIZES, loadWordList } from "./load.ts";
import { dailyWord } from "./daily.ts";
import { readWordLists } from "./lists.ts";
import { EN_WORDS } from "./lists/words-en.data.ts";
import { KOTOBA_STRINGS } from "./strings.ts";
import { VERSION } from "./version.ts";

/** The command line, as plain data: arguments in, what to print and the exit code out. */

describe("the command line", () => {
  it("prints its version and its help, in the language asked for", async () => {
    expect(await runCli(["--version"])).toEqual({ code: 0, out: `${VERSION}\n`, err: "" });
    expect((await runCli(["-h"])).out).toBe(KOTOBA_STRINGS.en.cliUsage);
    expect((await runCli(["--help", "--lang", "ja"])).out).toBe(KOTOBA_STRINGS.ja.cliUsage);
    expect((await runCli(["--help"], { env: { LANG: "ja_JP.UTF-8" } })).out).toBe(KOTOBA_STRINGS.ja.cliUsage);
    expect((await runCli(["--help", "--lang", "en"], { env: { LANG: "ja_JP.UTF-8" } })).out).toBe(KOTOBA_STRINGS.en.cliUsage);
    expect((await runCli(["--help"], { env: { LC_ALL: "en_US.UTF-8", LANG: "ja_JP.UTF-8" } })).out).toBe(KOTOBA_STRINGS.en.cliUsage);
    expect((await runCli(["--help"], { env: { LANG: "C" }, locale: "ja-JP" })).out).toBe(KOTOBA_STRINGS.ja.cliUsage);
  });

  it("checks a word against the list its letters belong to, and exits 1 for one that may not be guessed", async () => {
    expect(await runCli(["check", "crane"])).toEqual({ code: 0, out: "crane  English, 5 letters\n  may be guessed: yes\n  may be the hidden word: yes\n  an easy word: no\n", err: "" });
    const refused = await runCli(["check", "XXXXX"]);
    expect(refused.code).toBe(1);
    expect(refused.out).toBe("xxxxx  English, 5 letters\n  may be guessed: no\n  may be the hidden word: no\n  an easy word: no\n");
    const easy = await runCli(["check", "able"]);
    expect(easy.out).toContain("an easy word: yes");
    expect(easy.out.startsWith("able  English, 4 letters")).toBe(true);
    expect((await runCli(["check", "さくら"])).out.startsWith("さくら  かな, 3 kana\n  may be guessed: yes")).toBe(true);
    expect((await runCli(["check", "bonjour", "--words", "fr"])).code).toBe(1);
    expect((await runCli(["check", "chien", "--words", "fr"])).out.startsWith("chien  Français, 5 letters")).toBe(true);
    expect((await runCli(["check", "crane", "--lang", "ja"])).out).toBe("crane  English、5文字\n  推測できる: はい\n  隠された単語になりうる: はい\n  やさしい単語: いいえ\n");
  });

  it("says why a word cannot be looked up: no list of that size", async () => {
    expect(await runCli(["check", "cranes!!"])).toEqual({ code: 1, out: "", err: "kotoba: there is no list of 8 in English: 4, 5, 6\n" });
  });

  it("checks as JSON", async () => {
    expect(JSON.parse((await runCli(["check", "crane", "--json"])).out)).toEqual({ format: 1, word: "crane", words: "en", size: 5, mayGuess: true, mayHide: true, easy: false });
    expect((await runCli(["check", "zzzzz", "--json"])).code).toBe(1);
  });

  it("lists the words of a list, one to a line, by tier", async () => {
    const english = readWordLists(EN_WORDS, 4)!;
    const easy = await runCli(["list", "--size", "4", "--tier", "easy"]);
    expect(easy.out).toBe(`${english.easy.join("\n")}\n`);
    expect((await runCli(["list", "--size", "4"])).out).toBe(`${english.answers.join("\n")}\n`);
    expect((await runCli(["list", "--size", "4", "--tier", "allowed"])).out.split("\n").filter(Boolean)).toHaveLength(english.allowed.size);
    const kana = (await runCli(["list", "--words", "ja", "--tier", "easy"])).out.split("\n").filter(Boolean);
    expect(kana.every((word) => [...word].length === 4)).toBe(true);
    const json = JSON.parse((await runCli(["list", "--size", "4", "--tier", "easy", "--json"])).out);
    expect(json).toMatchObject({ format: 1, words: "en", size: 4, tier: "easy", count: english.easy.length });
    expect(json.list).toEqual(english.easy);
  });

  it("marks a guess against the hidden word, with a sign for each place and a legend", async () => {
    expect(await runCli(["mark", "crane", "react"])).toEqual({ code: 0, out: "c r a n e\n◐ ◐ ● ○ ◐\n● right place, ◐ elsewhere in the word, ○ not in the word\n", err: "" });
    expect((await runCli(["mark", "ばな", "はな"])).out).toBe("ば な\n●↑ ●\n● right place, ↑ wrong mark\n");
    expect((await runCli(["mark", "CRANE", "Crane"])).out.split("\n")[1]).toBe("● ● ● ● ●");
    const json = JSON.parse((await runCli(["mark", "crane", "react", "--json"])).out);
    expect(json.marks.map((one: { mark: string }) => one.mark)).toEqual(["near", "near", "hit", "miss", "near"]);
    expect((await runCli(["mark", "crane", "react", "--lang", "ja"])).out).toContain("● 場所が合っている");
  });

  it("gives the word of a day, the same one the package gives", async () => {
    const answers = readWordLists(EN_WORDS, 5)!.answers;
    const ran = await runCli(["daily", "--date", "2026-10-01"]);
    expect(ran).toEqual({ code: 0, out: "2026-10-01  elect\n", err: "" });
    expect(dailyWord(answers, "2026-10-01", { salt: "en-5-answers" })).toBe("elect");
    const json = JSON.parse((await runCli(["daily", "--date", "2026-10-01", "--json"])).out);
    expect(json).toMatchObject({ day: "2026-10-01", words: "en", size: 5, tier: "answers", salt: "en-5-answers", word: "elect" });
    expect(answers[json.index]).toBe("elect");
    const easy = JSON.parse((await runCli(["daily", "--date", "2026-10-01", "--tier", "easy", "--json"])).out);
    expect(readWordLists(EN_WORDS, 5)!.easy).toContain(easy.word);
    expect(easy.salt).toBe("en-5-easy");
  });

  it("takes today from the clock, in UTC or at a place's midnight", async () => {
    const now = Date.parse("2026-10-01T23:30:00Z");
    expect((await runCli(["daily"], { now })).out.startsWith("2026-10-01  ")).toBe(true);
    expect((await runCli(["daily", "--zone", "Asia/Tokyo"], { now })).out.startsWith("2026-10-02  ")).toBe(true);
    expect((await runCli(["daily", "--zone", "Nowhere/Land"], { now })).err).toContain("not a time zone");
  });

  it("lists every list with its sizes", async () => {
    const ran = await runCli(["lists"]);
    const rows = ran.out.trim().split("\n");
    expect(rows).toHaveLength(1 + Object.values(WORD_LIST_SIZES).reduce((sum, sizes) => sum + sizes.length, 0));
    expect(rows[0]).toMatch(/^List\s+Size\s+Easy\s+Answers\s+Allowed$/);
    const english = readWordLists(EN_WORDS, 5)!;
    expect(rows.find((row) => /^English\s+5\s/.test(row))!.split(/\s+/)).toEqual(["English", "5", String(english.easy.length), String(english.answers.length), String(english.allowed.size)]);
    const json = JSON.parse((await runCli(["lists", "--words", "fr", "--json"])).out);
    expect(json.lists.map((row: { size: number }) => row.size)).toEqual([4, 5, 6]);
    expect(JSON.parse((await runCli(["lists", "--size", "3", "--json"])).out).lists).toHaveLength(1);
  });

  it("loads each list by itself, and none that does not exist", async () => {
    expect((await loadWordList("en", 5))!.answers.length).toBeGreaterThan(1000);
    expect((await loadWordList("ja", 3))!.release).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(await loadWordList("en", 3)).toBeNull();
    expect(await loadWordList("ja", 6)).toBeNull();
  });

  it("is exit code 2, with a pointer to the help, for a command that is wrong", async () => {
    const tried = (args: string[]) => runCli(args);
    expect(await tried([])).toEqual({ code: 2, out: "", err: "kotoba: say what to do: check, list, mark, daily or lists\nTry `kotoba --help`.\n" });
    expect((await tried(["guess"])).err).toContain("“guess” is not a command");
    expect((await tried(["list", "--bogus"])).err).toContain("unknown option --bogus");
    expect((await tried(["list", "--size"])).err).toContain("--size needs a value");
    expect((await tried(["list", "--size", "9"])).err).toContain("--size takes a whole number: 4 – 6, ja 3 – 5");
    expect((await tried(["list", "--words", "ja", "--size", "6"])).err).toContain("3, 4, 5");
    expect((await tried(["list", "--words", "xx"])).err).toContain("--words takes en, fr, de or ja");
    expect((await tried(["list", "--tier", "all"])).err).toContain("--tier takes easy, answers, allowed");
    expect((await tried(["daily", "--tier", "allowed"])).err).toContain("--tier takes easy, answers");
    expect((await tried(["daily", "--date", "2026-02-30"])).err).toContain("--date takes a day written YYYY-MM-DD");
    expect((await tried(["check"])).err).toContain("give the word to check");
    expect((await tried(["mark", "crane"])).err).toContain("give the guess and then the hidden word");
    expect((await tried(["mark", "crane", "reacts"])).err).toContain("the guess has 5 letters and the hidden word 6");
    expect((await tried(["mark", "cr4ne", "react"])).err).toContain("“cr4ne” is not made of letters");
    expect((await tried(["list", "--lang", "fr"])).err).toContain("--lang takes en or ja");
    expect((await tried(["list", "--bogus", "--lang", "ja"])).err).toContain("不明なオプションです: --bogus");
    expect((await tried(["list", "--size=4", "--tier=easy"])).code).toBe(0);
  });
});
