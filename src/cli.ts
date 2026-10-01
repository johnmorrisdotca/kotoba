import { dailyIndex, dayKey, isDayKey } from "./daily.ts";
import { guessMarks } from "./game.ts";
import { WORD_LIST_NAMES, WORD_LIST_SIZES, loadWordList, type LoadedWordList, type WordListName } from "./load.ts";
import { ALPHABETS } from "./marks.ts";
import { KOTOBA_STRINGS, kotobaLanguage, kotobaSay, type KotobaStrings, type Language } from "./strings.ts";
import { VERSION } from "./version.ts";

/**
 * The command line, as a pure function: arguments and surroundings in, what to
 * print and the exit code out. `bin/kotoba.mjs` is the few lines that hand it
 * the real process. The only thing it reads is a word list, fetched as its own
 * module the first time it is needed, so a command reads one list and no more.
 */

/** What the command line is run in. All of it is optional. */
export type CliSurroundings = {
  /** The environment, for the language: `LC_ALL`, `LC_MESSAGES` and `LANG`. */
  env?: Record<string, string | undefined>;
  /** The system's language where the environment names none: what `Intl` says, on Windows. */
  locale?: string;
  /** The time, in epoch milliseconds, for `daily` with no `--date`. Now, unless given. */
  now?: number;
};

/** What the command line came to. */
export type CliResult = {
  /** 0 when all went well, 1 when what was asked for is not so or could not be done, 2 when the command itself was wrong. */
  code: 0 | 1 | 2;
  /** For standard output. */
  out: string;
  /** For standard error. */
  err: string;
};

/** The lists the command line reads: the alphabet languages and Japanese kana. */
export type CliWords = WordListName;

/** Which words of a list: the easy answers, every answer, or every word that may be guessed. */
export type CliTier = "easy" | "answers" | "allowed";

/** The language the command line speaks: `--lang`, or the environment's, or the system's; Japanese for `ja…`, English for anything else. */
export function cliLanguage(flag: string | undefined, env: Record<string, string | undefined> = {}, locale?: string): Language {
  const named = [flag, env.LC_ALL, env.LC_MESSAGES, env.LANG].find((value) => value !== undefined && value !== "" && value !== "C" && value !== "POSIX" && !value.startsWith("C."));
  return kotobaLanguage(named ?? locale);
}

const FLAGS_WITH_VALUES: Record<string, string> = { "--words": "words", "--size": "size", "--tier": "tier", "--date": "date", "--zone": "zone", "--lang": "lang" };
const FLAGS: Record<string, string> = { "-j": "json", "--json": "json", "-h": "help", "--help": "help", "-v": "version", "--version": "version" };
const COMMANDS = ["check", "list", "mark", "daily", "lists"] as const;
const WORDS: readonly CliWords[] = WORD_LIST_NAMES;
const NAMES: Record<CliWords, "listEn" | "listFr" | "listDe" | "listJa"> = { en: "listEn", fr: "listFr", de: "listDe", ja: "listJa" };

type Asked = { values: Record<string, string>; flags: Set<string>; words: string[]; wrong: { message: "cliUnknown" | "cliNeeds"; part: string } | null };

/** The arguments sorted into options and words. */
function sortArguments(args: readonly string[]): Asked {
  const asked: Asked = { values: {}, flags: new Set(), words: [], wrong: null };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i] as string;
    const [name, inline] = arg.startsWith("--") && arg.includes("=") ? [arg.slice(0, arg.indexOf("=")), arg.slice(arg.indexOf("=") + 1)] : [arg, undefined];
    if (arg === "--") {
      asked.words.push(...args.slice(i + 1));
      break;
    }
    if (name in FLAGS_WITH_VALUES) {
      const value = inline ?? args[++i];
      if (value === undefined) {
        asked.wrong ??= { message: "cliNeeds", part: name };
        break;
      }
      asked.values[FLAGS_WITH_VALUES[name] as string] = value;
    } else if (name in FLAGS && inline === undefined) asked.flags.add(FLAGS[name] as string);
    // The first wrong option is the one reported; the rest are still read, so that the report comes in the language asked for.
    else if (arg.startsWith("-") && arg !== "-") asked.wrong ??= { message: "cliUnknown", part: arg };
    else asked.words.push(arg);
  }
  return asked;
}

const hasKana = (text: string) => /[぀-ヿ]/.test(text);

/** The size of a list as a person says it: "5 letters", "4 kana". */
const sizeSays = (t: KotobaStrings, words: CliWords, size: number) => kotobaSay(words === "ja" ? t.kana : t.letters, { n: size });

/** Run the command line. See `kotoba --help` for what it takes. */
export async function runCli(args: readonly string[], around: CliSurroundings = {}): Promise<CliResult> {
  const asked = sortArguments(args);
  const env = around.env ?? {};
  const lang = asked.values.lang;
  const language = cliLanguage(lang, env, around.locale);
  const t = KOTOBA_STRINGS[language];
  const wrong = (message: string): CliResult => ({ code: 2, out: "", err: `kotoba: ${message}\n${t.cliTryHelp}\n` });
  const failed = (message: string): CliResult => ({ code: 1, out: "", err: `kotoba: ${message}\n` });
  if (asked.wrong !== null) return wrong(kotobaSay(t[asked.wrong.message], { part: asked.wrong.part }));
  if (lang !== undefined && lang !== "en" && lang !== "ja") return wrong(t.cliLangBad);
  if (asked.flags.has("help")) return { code: 0, out: t.cliUsage, err: "" };
  if (asked.flags.has("version")) return { code: 0, out: `${VERSION}\n`, err: "" };
  const command = asked.words[0];
  if (command === undefined) return wrong(t.cliNoCommand);
  if (!(COMMANDS as readonly string[]).includes(command)) return wrong(kotobaSay(t.cliCommandBad, { part: command }));
  const json = asked.flags.has("json");
  const given = asked.words.slice(1);
  const emit = (data: unknown): CliResult => ({ code: 0, out: `${JSON.stringify(data, null, 2)}\n`, err: "" });

  if (asked.values.words !== undefined && !(WORDS as readonly string[]).includes(asked.values.words)) return wrong(t.cliWordsBad);
  const chosen = asked.values.words as CliWords | undefined;
  const sizeFlag = asked.values.size;
  let askedSize: number | null = null;
  if (sizeFlag !== undefined) {
    askedSize = /^\d{1,2}$/.test(sizeFlag) ? Number(sizeFlag) : null;
    const fits = (words: CliWords) => askedSize !== null && WORD_LIST_SIZES[words].includes(askedSize);
    if (askedSize === null || (chosen !== undefined && !fits(chosen)) || (chosen === undefined && !WORDS.some(fits))) {
      return wrong(kotobaSay(t.cliSizeBad, { sizes: chosen === undefined ? "4 – 6, ja 3 – 5" : `${WORD_LIST_SIZES[chosen].join(", ")}` }));
    }
  }
  const tier = asked.values.tier;
  if (tier !== undefined && !["easy", "answers", "allowed"].includes(tier)) return wrong(kotobaSay(t.cliTierBad, { tiers: "easy, answers, allowed" }));

  /** The list a command reads: the words and size asked for, or the usual. */
  const resolve = async (words: CliWords, size: number) => ({ words, size, list: await loadWordList(words, size) });
  const noList = (words: CliWords, size: number) => failed(kotobaSay(t.cliNoList, { size, words: t[NAMES[words]], sizes: WORD_LIST_SIZES[words].join(", ") }));

  if (command === "lists") {
    const rows: { words: CliWords; size: number; easy: number; answers: number; allowed: number }[] = [];
    for (const words of WORDS) {
      if (chosen !== undefined && chosen !== words) continue;
      for (const size of WORD_LIST_SIZES[words]) {
        if (askedSize !== null && askedSize !== size) continue;
        const list = (await loadWordList(words, size)) as LoadedWordList;
        rows.push({ words, size, easy: list.easy.length, answers: list.answers.length, allowed: list.allowed.size });
      }
    }
    if (json) return emit({ format: 1, generator: `kotoba ${VERSION}`, lists: rows });
    const table = [t.cliListsHead.split(","), ...rows.map((row) => [t[NAMES[row.words]], String(row.size), String(row.easy), String(row.answers), String(row.allowed)])];
    const widths = table[0]!.map((_, column) => Math.max(...table.map((row) => [...(row[column] as string)].length)));
    const lines = table.map((row) => row.map((cell, column) => (column < 1 ? cell + " ".repeat(widths[column]! - [...cell].length) : " ".repeat(widths[column]! - [...cell].length) + cell)).join("  "));
    return { code: 0, out: `${lines.join("\n")}\n`, err: "" };
  }

  if (command === "check") {
    const word = given[0]?.toLowerCase();
    if (word === undefined || word === "") return wrong(t.cliNoWord);
    const words: CliWords = hasKana(word) ? "ja" : (chosen ?? "en");
    const size = [...word].length;
    const { list } = await resolve(words, size);
    if (list === null) return noList(words, size);
    const mayGuess = list.allowed.has(word) || list.answers.includes(word);
    const mayHide = list.answers.includes(word);
    const easy = list.easy.includes(word);
    if (json) return { ...emit({ format: 1, word, words, size, mayGuess, mayHide, easy }), code: mayGuess ? 0 : 1 };
    const yes = (flag: boolean) => (flag ? t.cliYes : t.cliNo);
    const lines = [
      kotobaSay(t.cliCheckHead, { word, words: t[NAMES[words]], size: sizeSays(t, words, size) }),
      `  ${t.cliMayGuess}: ${yes(mayGuess)}`,
      `  ${t.cliMayHide}: ${yes(mayHide)}`,
      `  ${t.cliIsEasy}: ${yes(easy)}`,
    ];
    return { code: mayGuess ? 0 : 1, out: `${lines.join("\n")}\n`, err: "" };
  }

  if (command === "mark") {
    const [guess, hidden] = [given[0]?.toLowerCase(), given[1]?.toLowerCase()];
    if (guess === undefined || hidden === undefined) return wrong(t.cliNoMarkWords);
    const words: CliWords = hasKana(guess) || hasKana(hidden) ? "ja" : (chosen ?? "en");
    const alphabet = words === "ja" ? null : new RegExp(`^[${ALPHABETS[words]}]+$`, "i");
    for (const part of [guess, hidden]) {
      if (alphabet !== null ? !alphabet.test(part) : !/^[぀-ゟー]+$/.test(part)) return wrong(kotobaSay(t.cliNotLetters, { part }));
    }
    if ([...guess].length !== [...hidden].length) return wrong(kotobaSay(t.cliLengthsDiffer, { guess: [...guess].length, hidden: [...hidden].length }));
    const marks = guessMarks({ language: words, hidden }, guess);
    if (json) return emit({ format: 1, guess, hidden, marks });
    const sign = { hit: "●", near: "◐", miss: "○", kin: "≈" };
    const name = { hit: t.markHit, near: t.markNear, miss: t.markMiss, kin: t.markKin };
    const says = marks.map((one) => `${sign[one.mark]}${one.wrongSize ? "↓" : ""}${one.wrongMark ? "↑" : ""}`);
    const used = (["hit", "near", "kin", "miss"] as const).filter((mark) => marks.some((one) => one.mark === mark));
    const legend = [...used.map((mark) => `${sign[mark]} ${name[mark]}`), ...(marks.some((one) => one.wrongSize) ? [`↓ ${t.arrowSize}`] : []), ...(marks.some((one) => one.wrongMark) ? [`↑ ${t.arrowTone}`] : [])];
    return { code: 0, out: `${[...guess].join(" ")}\n${says.join(" ")}\n${legend.join(", ")}\n`, err: "" };
  }

  // list and daily read one list.
  const words: CliWords = chosen ?? "en";
  const size = askedSize ?? (words === "ja" ? 4 : 5);
  const { list } = await resolve(words, size);
  if (list === null) return noList(words, size);
  if (command === "list") {
    const which = (tier ?? "answers") as CliTier;
    const picked = which === "easy" ? list.easy : which === "answers" ? list.answers : [...list.allowed];
    if (json) return emit({ format: 1, generator: `kotoba ${VERSION}`, words, size, tier: which, count: picked.length, list: picked });
    return { code: 0, out: picked.length === 0 ? "" : `${picked.join("\n")}\n`, err: "" };
  }

  // daily
  if (tier === "allowed") return wrong(kotobaSay(t.cliTierBad, { tiers: "easy, answers" }));
  const pool = tier === "easy" ? list.easy : list.answers;
  const which = tier === "easy" ? "easy" : "answers";
  let day: string;
  if (asked.values.date !== undefined) {
    if (!isDayKey(asked.values.date)) return wrong(t.cliDayBad);
    day = asked.values.date;
  } else {
    try {
      day = dayKey(around.now ?? Date.now(), asked.values.zone);
    } catch {
      return wrong(kotobaSay(t.cliZoneBad, { part: asked.values.zone ?? "" }));
    }
  }
  const salt = `${words}-${size}-${which}`;
  const index = dailyIndex(pool.length, day, salt);
  const word = pool[index] as string;
  if (json) return emit({ format: 1, generator: `kotoba ${VERSION}`, day, words, size, tier: which, salt, index, word });
  return { code: 0, out: `${kotobaSay(t.cliDaily, { day, word })}\n`, err: "" };
}
