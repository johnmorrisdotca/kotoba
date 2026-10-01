// Runs the built command line as a person would: as a child process, on
// whatever system this is. `pnpm test:cli` builds first. The rules of the
// command line are tested as plain data in src/cli.test.ts; this is the part
// only a real process can show: the exit code, the two streams, standard
// input, the environment.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(root, "bin", "kotoba.mjs");
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
// An environment with no language of its own, so each case says what it means.
const bare = { ...process.env, LC_ALL: "", LC_MESSAGES: "", LANG: "en_US.UTF-8" };

let failed = 0;
function check(what, args, want, { input, env } = {}) {
  const ran = spawnSync(process.execPath, [bin, ...args], { input, encoding: "utf8", env: { ...bare, ...env } });
  const got = { code: ran.status, out: ran.stdout, err: ran.stderr };
  const problems = [];
  if (want.code !== undefined && got.code !== want.code) problems.push(`exit code ${got.code}, wanted ${want.code}`);
  for (const stream of ["out", "err"]) {
    const wanted = want[stream];
    if (wanted === undefined) continue;
    const ok = wanted instanceof RegExp ? wanted.test(got[stream]) : typeof wanted === "function" ? wanted(got[stream]) : got[stream] === wanted;
    if (!ok) problems.push(`${stream} was ${JSON.stringify(got[stream])}, wanted ${wanted instanceof RegExp ? wanted : JSON.stringify(wanted)}`);
  }
  if (problems.length > 0) failed += 1;
  console.log(`${problems.length === 0 ? "ok  " : "FAIL"} ${what}${problems.map((p) => `\n       ${p}`).join("")}`);
  return got;
}

check("the version", ["--version"], { code: 0, out: `${version}\n`, err: "" });
check("help", ["--help"], { code: 0, out: /^Usage: kotoba/, err: "" });
check("a word in the list", ["check", "crane"], { code: 0, err: "", out: "crane  English, 5 letters\n  may be guessed: yes\n  may be the hidden word: yes\n  an easy word: no\n" });
check("a word not in the list is exit code 1", ["check", "xxxxx"], { code: 1, err: "", out: /may be guessed: no/ });
check("a word in kana", ["check", "さくら"], { code: 0, out: /^さくら {2}かな, 3 kana\n/ });
check("a guess marked", ["mark", "crane", "react"], { code: 0, err: "", out: "c r a n e\n◐ ◐ ● ○ ◐\n● right place, ◐ elsewhere in the word, ○ not in the word\n" });
check("the word of a day", ["daily", "--date", "2026-10-01"], { code: 0, err: "", out: "2026-10-01  elect\n" });
check("the word of a day by a place's midnight", ["daily", "--zone", "Asia/Tokyo"], { code: 0, err: "", out: /^\d{4}-\d{2}-\d{2} {2}[a-z]{5}\n$/ });
check("a list, one word to a line", ["list", "--size", "4", "--tier", "easy"], { code: 0, err: "", out: (out) => out.startsWith("able\nacid\nakin\n") });
const lists = check("the lists as JSON", ["lists", "--json"], { code: 0, err: "", out: /^\{\n {2}"format": 1,/ });
try {
  const data = JSON.parse(lists.out);
  if (data.lists.length !== 12 || data.lists[0].words !== "en" || data.lists[0].size !== 4) throw new Error("not the twelve lists");
  console.log("ok   the JSON parses, and names every list");
} catch (error) {
  failed += 1;
  console.log(`FAIL the JSON parses: ${error.message}`);
}
check("a wrong option is exit code 2", ["list", "--bogus"], { code: 2, out: "", err: /unknown option --bogus/ });
check("Japanese by flag", ["check", "crane", "--lang", "ja"], { code: 0, out: /^crane {2}English、5文字\n/ });
check("Japanese by LANG", ["--help"], { code: 0, out: /^使い方: kotoba/ }, { env: { LANG: "ja_JP.UTF-8" } });
check("English by flag over LANG", ["--help", "--lang", "en"], { code: 0, out: /^Usage: kotoba/ }, { env: { LANG: "ja_JP.UTF-8" } });

if (failed > 0) {
  console.log(`${failed} failed`);
  process.exit(1);
}
console.log("the command line does what it says, on", process.platform, process.version);
