// The documents that are made from the source, or that quote it, checked against it.
// Plain JavaScript, so that reading files needs no Node types. `pnpm docs:make` rewrites what is made.
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import { describe, expect, it } from "vitest";

import { runCli } from "./cli.ts";
import * as kotoba from "./index.ts";
import { WORD_LIST_NAMES, WORD_LIST_SIZES, loadWordList } from "./load.ts";
import { KOTOBA_PLAY_CSS, KOTOBA_PLAY_VARIABLES } from "./play.ts";
import { KOTOBA_STRINGS } from "./strings.ts";

const { KANA_SIZES, VERSION, WORD_GAME_ROWS, dailyWord, dayKey, markGuess, readWordLists, startWordGame, submitWordGame, typeWordGame } = kotoba;

const readme = readFileSync("README.md", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const cell = (text) => text.replace(/\\\|/g, "|").trim();

/** The rows of the table under a heading: each row's cells. */
function table(heading, doc = readme) {
  const from = doc.indexOf(heading);
  if (from < 0) throw new Error(`no “${heading}”`);
  const rows = [];
  for (const line of doc.slice(from).split("\n").slice(1)) {
    if (line.startsWith("|")) rows.push(line.split(/(?<!\\)\|/).slice(1, -1).map(cell));
    else if (rows.length > 0) break;
  }
  return rows.slice(2);
}

/** A line of a README example: it must be there to the letter. */
const says = (line) => expect(readme, line).toContain(line);

const english = async (size) => (await loadWordList("en", size)) ?? (() => { throw new Error("no list"); })();

describe("the README in 30 seconds", () => {
  it("the lines come to what they say", async () => {
    says('markGuess("crane", "react");        // ["near", "near", "hit", "miss", "near"]');
    expect(markGuess("crane", "react")).toEqual(["near", "near", "hit", "miss", "near"]);
    says("five.allowed.has(\"crane\");          // true: a word that may be guessed");
    const { EN_WORDS } = await import("./lists/words-en.data.ts");
    const five = readWordLists(EN_WORDS, 5);
    expect(five.allowed.has("crane")).toBe(true);
    expect(five.answers.length).toBeGreaterThan(1000);
  });

  it("the board and the terminal lines are the package's", async () => {
    says('mountKotoba(document.getElementById("game")!, { words: "en", size: 5, daily: true });');
    says("npx @johnmorrisdotca/kotoba check crane");
    expect((await runCli(["check", "crane"])).code).toBe(0);
    expect(typeof (await import("./play.ts")).mountKotoba).toBe("function");
  });
});

describe("the README on the rules alone", () => {
  it("the word of the day, and a round through a guess, come to what the comments say", async () => {
    says('dailyWord(five.answers, "2026-10-01", { salt: "en-5-answers" });   // "elect": the same on every machine, for everybody');
    const five = await english(5);
    expect(dailyWord(five.answers, "2026-10-01", { salt: "en-5-answers" })).toBe("elect");
    let round = startWordGame("en", 5, "crane");
    for (const key of "react") round = typeWordGame(round, key);
    const sent = submitWordGame(round, five);
    expect(sent.refused).toBeNull();
    expect(sent.game.guesses).toEqual(["react"]);
    expect(sent.game.status).toBe("playing");
  });

  it("the daily lines come to what they say", async () => {
    const five = await english(5);
    says('dailyWord(five.answers, "2026-10-01", { salt: "en-5-answers" });   // "elect"');
    says('dayKey(new Date("2026-10-01T23:30:00Z"), "Asia/Tokyo");            // "2026-10-02"');
    expect(dayKey(new Date("2026-10-01T23:30:00Z"), "Asia/Tokyo")).toBe("2026-10-02");
    expect(dailyWord(five.answers, new Date("2026-10-01T23:30:00Z"), { zone: "Asia/Tokyo", salt: "en-5-answers" })).toBe(dailyWord(five.answers, "2026-10-02", { salt: "en-5-answers" }));
  });

  it("loadWordList's line gives what the README says", async () => {
    says('const kana = await loadWordList("ja", 4);   // { easy, answers, allowed, release }, or null for a size there is no list of');
    const kana = await loadWordList("ja", 4);
    expect(Object.keys(kana).sort()).toEqual(["allowed", "answers", "easy", "release"]);
    expect(await loadWordList("ja", 6)).toBeNull();
  });

  it("the plain page's script is the one the README shows", () => {
    expect(readme).toContain('import { mountKotoba } from "./node_modules/@johnmorrisdotca/kotoba/dist/play.js";');
    expect(readme).toContain('mountKotoba(document.getElementById("game"), { words: "fr", size: 5 });');
  });
});

describe("the README's lists", () => {
  it("the table of how many each list holds is what `kotoba lists` prints, and the easy answers are inside the answers inside the words that may be guessed", async () => {
    const rows = table("the lists):");
    expect(rows.length).toBe(WORD_LIST_NAMES.reduce((sum, name) => sum + WORD_LIST_SIZES[name].length, 0));
    const names = { en: "English", fr: "Français", de: "Deutsch", ja: "かな" };
    let at = 0;
    for (const name of WORD_LIST_NAMES) {
      for (const size of WORD_LIST_SIZES[name]) {
        const list = await loadWordList(name, size);
        expect(rows[at], `${name} ${size}`).toEqual([names[name], String(size), String(list.easy.length), String(list.answers.length), String(list.allowed.size)]);
        for (const word of list.easy) expect(list.answers.includes(word) || list.allowed.has(word), word).toBe(true);
        expect(list.easy.every((word) => list.allowed.has(word)), `${name} ${size} easy`).toBe(true);
        expect(list.answers.every((word) => list.allowed.has(word)), `${name} ${size} answers`).toBe(true);
        at += 1;
      }
    }
  });

  it("every entry point in the README's table of lists is an export of the package, and a file the package ships", () => {
    for (const row of table("## The lists")) {
      for (const entry of [...row[0].matchAll(/`@johnmorrisdotca\/kotoba\/([\w-]+)`|`\/([\w-]+)`/g)]) expect(Object.keys(pkg.exports), row[0]).toContain(`./${entry[1] ?? entry[2]}`);
    }
  });
});

describe("the README on a round", () => {
  it("the table names functions the package exports", () => {
    const named = table("## A round").flatMap((row) => [...row[0].matchAll(/`(\w+)\(/g)].map((match) => match[1]));
    expect(named).toEqual(["startWordGame", "typeWordGame", "eraseWordGame", "changeWordGame", "submitWordGame", "guessMarks", "keyMarks", "wordGameKeys"]);
    for (const name of named) expect(typeof kotoba[name], name).toBe("function");
    expect(WORD_GAME_ROWS).toBe(6);
    expect(startWordGame("en", 5, "crane").rows).toBe(6);
  });
});

describe("the README on the board", () => {
  const source = readFileSync("src/play.ts", "utf8");

  it("the options table lists exactly the options of KotobaPlayOptions, in order", () => {
    const type = source.slice(source.indexOf("export type KotobaPlayOptions = {"), source.indexOf("\n};", source.indexOf("export type KotobaPlayOptions = {")));
    const declared = [...type.matchAll(/^ {2}(\w+)\??:/gm)].map((match) => match[1]);
    const documented = table("## Play it on a page").map((row) => row[0].replaceAll("`", ""));
    expect(documented).toEqual(declared);
  });

  it("the theming table is the stylesheet's variables with their values, and the stylesheet uses every one", () => {
    const rows = table("## Theming");
    expect(rows.map((row) => [row[0].replaceAll("`", ""), row[2].replaceAll("`", "")])).toEqual(Object.entries(KOTOBA_PLAY_VARIABLES));
    for (const name of Object.keys(KOTOBA_PLAY_VARIABLES)) expect(KOTOBA_PLAY_CSS, name).toContain(`${name}:`);
  });

  it("the defaults the options table gives are the board's", () => {
    const rows = Object.fromEntries(table("## Play it on a page").map((row) => [row[0].replaceAll("`", ""), row]));
    expect(rows.rows[2]).toBe(String(WORD_GAME_ROWS));
    expect(rows.words[2]).toBe("`en`");
    expect(rows.size[2]).toBe("5, or 4 for `ja`");
    expect(rows.keyboard[2]).toBe("`true`");
  });
});

describe("the README's command line", () => {
  it("shows the help the package prints, word for word", () => {
    const from = readme.indexOf("```\nUsage: kotoba") + 4;
    expect(readme.slice(from, readme.indexOf("```", from))).toBe(KOTOBA_STRINGS.en.cliUsage);
  });

  it("shows what a check, a mark and the word of a day say", async () => {
    const shown = readme.slice(readme.indexOf("$ kotoba check crane"), readme.indexOf("```", readme.indexOf("$ kotoba check crane")));
    const check = (await runCli(["check", "crane"])).out;
    const mark = (await runCli(["mark", "crane", "react"])).out;
    const daily = (await runCli(["daily", "--words", "en", "--size", "5", "--date", "2026-10-01"])).out;
    expect(shown).toBe(`$ kotoba check crane\n${check}$ kotoba mark crane react\n${mark}$ kotoba daily --words en --size 5 --date 2026-10-01\n${daily}`);
  });

  it("the entry point it names exports runCli", async () => {
    expect(Object.keys(pkg.exports)).toContain("./cli");
    expect(typeof (await import("./cli.ts")).runCli).toBe("function");
  });
});

describe("the README's limits", () => {
  it("are the constants", () => {
    const rows = Object.fromEntries(table("## Limits").map((row) => [row[0], row]));
    expect(rows["Lengths of English, French and German words"][1]).toBe(`${WORD_LIST_SIZES.en.join(", ").replace(/, (\d)$/, " or $1")} letters`);
    expect(rows["Lengths of Japanese words"][1]).toBe(`${KANA_SIZES.join(", ").replace(/, (\d)$/, " or $1")} kana`);
    expect(WORD_LIST_SIZES.fr).toEqual(WORD_LIST_SIZES.en);
    expect(WORD_LIST_SIZES.de).toEqual(WORD_LIST_SIZES.en);
    expect(WORD_LIST_SIZES.ja).toEqual(KANA_SIZES);
    expect(rows["Guesses in a round"][1]).toBe(`${WORD_GAME_ROWS} unless \`rows\` says`);
    expect(dayKey(new Date(Date.UTC(9999, 11, 31)))).toBe("9999-12-31");
    expect(kotoba.isDayKey("0000-01-01")).toBe(true);
  });
});

describe("the licences", () => {
  it("LICENSE is the plain MIT text, so that GitHub names it, and NOTICE.md carries the lists' terms and names every list", () => {
    const licence = readFileSync("LICENSE", "utf8");
    expect(licence.startsWith("MIT License\n")).toBe(true);
    expect(licence).not.toContain("THE WORD LISTS");
    const notice = readFileSync("NOTICE.md", "utf8");
    for (const entry of ["words-en", "pop-guesses", "words-fr", "words-de", "kana-3", "kana-4", "kana-5", "pop-answers"]) expect(notice, entry).toContain(`\`${entry}\``);
    for (const name of ["SCOWL", "Lexique", "LanguageTool", "JMdict", "CC BY-SA 4.0"]) expect(notice, name).toContain(name);
    expect(pkg.files).toContain("NOTICE.md");
    expect(pkg.license).toBe("(MIT AND CC-BY-SA-4.0)");
  });
});

describe("the version", () => {
  it("is package.json's, and the changelog has it", () => {
    expect(VERSION).toBe(pkg.version);
    expect(readFileSync("CHANGELOG.md", "utf8")).toContain(`## [${VERSION}]`);
  });
});

describe("package.json", () => {
  it("names built files directly, has no dependencies, and needs Node 22 or later", () => {
    const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.bin), ...Object.values(pkg.exports).flatMap((entry) => Object.values(entry))];
    for (const file of pointed) expect(/^\.?\/?(dist|bin)\//.test(file), file).toBe(true);
    expect(pkg.dependencies).toBeUndefined();
    expect(pkg.engines.node).toBe(">=22");
  });

  it("has keywords that are many, lower case and not repeated, and a description that fits", () => {
    expect(pkg.keywords.length).toBeGreaterThan(30);
    expect(new Set(pkg.keywords).size).toBe(pkg.keywords.length);
    for (const word of pkg.keywords) expect(word).toBe(word.toLowerCase());
    expect(pkg.description.length).toBeLessThanOrEqual(400);
  });
});

describe("docs/strings-ja.md", () => {
  const escape = (text) => text.replaceAll("|", "\\|").replaceAll("\n", "<br>");
  const lines = [
    "# Kotoba's words, in English and Japanese",
    "",
    "Made from `src/strings.ts` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.",
    "",
    "**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please",
    "open a *Fix a translation* issue with the string's name. `{n}` and the other braces are filled in when shown.",
    "Names that begin `cli` are the command line's; the others are the game's.",
    "",
    "| Name | English | Japanese |",
    "| --- | --- | --- |",
    ...Object.keys(KOTOBA_STRINGS.en).filter((key) => key !== "cliUsage").map((key) => `| \`${key}\` | ${escape(KOTOBA_STRINGS.en[key])} | ${escape(KOTOBA_STRINGS.ja[key])} |`),
    "",
    "## The command line's help",
    "",
    "`cliUsage`, in English:",
    "",
    "```",
    KOTOBA_STRINGS.en.cliUsage.trimEnd(),
    "```",
    "",
    "and in Japanese:",
    "",
    "```",
    KOTOBA_STRINGS.ja.cliUsage.trimEnd(),
    "```",
    "",
  ];
  const made = lines.join("\n");

  it("is what the source makes: run `pnpm docs:make` after changing a string", () => {
    if (process.env.UPDATE_DOCS === "1") writeFileSync("docs/strings-ja.md", made);
    expect(readFileSync("docs/strings-ja.md", "utf8")).toBe(made);
  });
});
