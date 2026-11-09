import { de, en, es, fr, it, ja, pt } from "./childrenWords.ts";

type Language = "en" | "ja" | "fr" | "de" | "es" | "it" | "pt" | "all";
type Options = { lang?: Language; maxLength?: number; mode?: "name" | "text" };
type Result = { ok: true } | { ok: false; reason: "blocked" | "personal" | "shape"; word?: string };

const lists = { en, fr, de, es, it, pt, ja };
const leet: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "2": "z",
  "@": "a",
  $: "s",
  "!": "i",
  "|": "i",
  "+": "t",
};
const latin = (text: string) =>
  text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\p{M}/gu, "")
    .replace(/[01234578@$!|+]/g, (c) => leet[c] ?? c);
const kana = (text: string) =>
  text
    .normalize("NFKC")
    .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 96))
    .replace(/[\s　・･.,、。_\-ー~〜]/g, "");
/** An email or a web address: checked first, so a number inside one (kid69@...) is a contact detail, not a joke. */
const contact = (text: string) =>
  /[^\s@]+@[^\s@]+\.[^\s@]+|https?:|www\.|\.[a-z]{2,6}(?:\/|$)|\.(?:com|net|org|jp|ca|io|co)\b/iu.test(
    text.normalize("NFKC"),
  );
const personal = (text: string) =>
  /[^\s@]+@[^\s@]+\.[^\s@]+|https?:|www\.|\.[a-z]{2,6}(?:\/|$)|\.(?:com|net|org|jp|ca|io|co)\b|\d{4,}|(?:\+?\d[\s().-]*){7,}|\b\d+\s+[\p{L}][\p{L}\s.'-]*\s(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd)\b/iu.test(
    text.normalize("NFKC"),
  );
/** Barred words that are also ordinary given names, so a child's own name or a story's (Puss in Boots) passes (John, 2026-11-09); "dickhead" stays barred. */
const NAMES = new Set(["dick", "puss"]);

/** Names that are also slang for a body part: they pass alone ("Dick Smith"), never beside a word that makes the joke ("Big Dick"). */
const NAME_WORDS = new Set([
  "dick",
  "dik",
  "dic",
  "dyck",
  "dck",
  "diq",
  "willy",
  "willie",
  "johnson",
  "cox",
  "wang",
  "weiner",
  "wiener",
  "schlong",
  "peen",
]);
const SUGGESTIVE = new Set(
  "big bigger biggest huge giant massive hard harder stiff long longer small tiny little fat hairy wet suck sucks sucked sucking sucker lick licks licking eat eats eating grab grabs touch touches rub rubs stroke strokes smell smells my your his hot sexy".split(
    " ",
  ),
);
const NAME_ONCE = new Set([...NAME_WORDS].map((name) => name.replace(/(.)\1+/g, "$1")));
const SUGGESTIVE_ONCE = new Set(
  [...SUGGESTIVE].filter((word) => word.length >= 2).map((word) => word.replace(/(.)\1+/g, "$1")),
);
/** Prank names that read as something else when said aloud, as whole words in a row, or run together ("MikeHunt"). */
const PRANKS = [
  "mike hunt",
  "mike hawk",
  "mike ox long",
  "mike ox mall",
  "mike litoris",
  "hugh jass",
  "hugh jazz",
  "hugh janus",
  "hugh g rection",
  "hugh rection",
  "hugh mungus",
  "ben dover",
  "benjamin dover",
  "seymour butts",
  "seymore butts",
  "dixie normous",
  "anita bath",
  "phil mccracken",
  "phil mcracken",
  "jack mehoff",
  "jack meoff",
  "heywood jablowme",
  "oliver clothesoff",
  "amanda hugginkiss",
  "ivana tinkle",
  "ivanna tinkle",
  "harry bahls",
  "harry balls",
  "dick hertz",
  "dick hurts",
  "mary juana",
  "eileen dover",
  "ollie clothesoff",
  "mike rotch",
  "dyl doe",
  "dil doe",
  "moe lester",
  "hugh jorgan",
  "ivana humpalot",
  "tess tickle",
];

const prepared = Object.fromEntries(
  Object.entries(lists).map(([language, words]) => [
    language,
    words
      .filter((word) => !NAMES.has(word))
      .map((word) => ({ word, form: language === "ja" ? kana(word) : latin(word) })),
  ]),
) as Record<Exclude<Language, "all">, { word: string; form: string }[]>;

/**
 * A word as it sounds, so a respelling matches: ph as f, c, ck and q as k, v as u, z as s, a doubled letter once, and the
 * endings y, i, ie, ee and ey as one ("puzzy", "pussee", "phuck", "fvck"). Compared whole word to whole word, in English only: respelling is how a child gets past an English list, and other languages spell these sounds their own way (Italian "cazzi" would catch "Cassie").
 */
const loose = (word: string) =>
  word
    .replace(/ph/g, "f")
    .replace(/ck|c|q/g, "k")
    .replace(/v/g, "u")
    .replace(/z/g, "s")
    .replace(/(?:ie|ee|ey|y)$/, "i")
    .replace(/(.)\1+/g, "$1");
const sounds = Object.fromEntries(
  Object.entries(prepared)
    .filter(([language]) => language === "en")
    .map(([language, entries]) => [
      language,
      new Map(entries.filter(({ form }) => form.length >= 4).map(({ word, form }) => [loose(form), word])),
    ]),
) as Record<string, Map<string, string>>;

function blocked(text: string, language: Exclude<Language, "all">): string | undefined {
  if (language === "ja") {
    const whole = kana(text);
    const tokens = text.split(/[\s　・･.,、。_~〜]+/u).map(kana);
    return prepared.ja.find(({ form }) => ([...form].length > 3 ? whole.includes(form) : tokens.includes(form)))?.word;
  }
  const raw = latin(text);
  const words = raw
    .split(/[^a-z]+/)
    .filter(Boolean)
    .map((part) => part.replace(/(.)\1{2,}/g, "$1$1"));
  const compact = words.join("");
  const stretched = words.map((part) => part.replace(/(.)\1+/g, "$1"));
  if (language === "en") {
    // Letters typed one at a time ("d i c k", "D.i.c.k") are read as one word.
    const tokens: string[] = [];
    let run = "";
    for (const part of words) {
      if (part.length === 1) run += part;
      else {
        if (run) tokens.push(run);
        run = "";
        tokens.push(part);
      }
    }
    if (run) tokens.push(run);
    const spaced = ` ${tokens.join(" ")} `;
    const prank = PRANKS.find((name) => spaced.includes(` ${name} `) || compact === name.replaceAll(" ", ""));
    if (prank) return prank;
    // A doubled or stretched letter is read once ("Diiick", "Dikk"), so the names are compared that way too.
    const once = (part: string) => part.replace(/(.)\1+/g, "$1");
    const isName = (part: string) =>
      [part, part.replace(/e?s$/, "")].some((form) => NAME_WORDS.has(form) || NAME_ONCE.has(once(form)));
    const isJoke = (part: string) => SUGGESTIVE.has(part) || SUGGESTIVE.has(once(part));
    const name = tokens.find(isName);
    const joke = name && tokens.find((part) => part !== name && isJoke(part));
    if (name && joke) return `${joke} ${name}`;
    // One word run together ("DickHard", "Bigdick"): a name and a joke word with little else.
    if (tokens.length === 1) {
      const word = once(tokens[0] ?? "");
      for (const nameForm of NAME_ONCE)
        for (const jokeForm of SUGGESTIVE_ONCE)
          if (
            word.includes(nameForm) &&
            word.includes(jokeForm) &&
            word.length <= nameForm.length + jokeForm.length + 3
          )
            return `${jokeForm} ${nameForm}`;
    }
  }
  // A letter hidden by a star or a hash ("sh*t", "p*ssy", "f**k") may be any letter.
  for (const token of text.normalize("NFKD").toLowerCase().replace(/\p{M}/gu, "").split(/\s+/)) {
    if (!/[*#]/.test(token)) continue;
    const pattern = latin(token)
      .replace(/[^a-z*#]/g, "")
      .replace(/[*#]/g, ".");
    if (pattern.replace(/\./g, "").length < 2) continue;
    const found = prepared[language].find(({ form }) => new RegExp(`^${pattern}$`).test(form));
    if (found) return found.word;
  }
  for (const part of words) {
    if (part.length < 4) continue;
    const found = sounds[language]?.get(loose(part));
    if (found && !NAMES.has(found)) return found;
  }
  for (const { word, form } of prepared[language]) {
    const single = form.replace(/(.)\1+/g, "$1");
    if (
      words.some((part) => part === form || part === `${form}s` || part === `${form}es`) ||
      stretched.some((part, i) => words[i] !== part && part === single)
    )
      return word;
    if (words.length > 1 && compact === form) return word;
    // A word glued to another ("shitface", "dumbfucker") starts or ends with it, and a long one (7 letters or more,
    // "xxmotherfuckeryy") is found anywhere; a short one in the middle is usually an
    // ordinary word ("Charlotte" holds "harlot", "Scunthorpe" a slur). English only: other languages' words collide
    // with names ("Merdani", "Foderaro"). This common profession is not an embedded assault term.
    if (
      language === "en" &&
      form.length >= 5 &&
      words.some(
        (part) =>
          part !== form && (part.startsWith(form) || part.endsWith(form) || (form.length >= 7 && part.includes(form))),
      ) &&
      !NAMES.has(form.replace(/s$/, "")) &&
      !(form === "rapist" && words.includes("therapist"))
    )
      return word;
  }
  return undefined;
}

/** Numbers that are jokes on their own: 69 and 420, and the hate code 1488. Only a whole number counts ("Apollo 11" passes). */
/** Calculator words that are only friendly: 0.7734 is hELLO, 77345 SHELL. */
const INNOCENT_READS = new Set(["hello", "hellos", "shell", "shells", "bells", "belles"]);
const NUMBER_JOKES = new Set(["69", "420", "1488"]);
/** A calculator's digits turned upside down: 5318008 reads BOOBIES, 7734 hELL. */
const UPSIDE_DOWN: Record<string, string> = {
  "0": "o",
  "1": "i",
  "2": "z",
  "3": "e",
  "4": "h",
  "5": "s",
  "6": "g",
  "7": "l",
  "8": "b",
  "9": "g",
};

function numberJoke(text: string): string | undefined {
  for (const token of text.split(/[^\p{L}\p{N}.]+/u)) {
    const digits = token.replace(/\./g, "");
    if (!/^\d+$/.test(digits)) continue;
    if (NUMBER_JOKES.has(digits)) return digits;
    if (digits.length < 4) continue;
    const upside = [...digits]
      .reverse()
      .map((digit) => UPSIDE_DOWN[digit] ?? digit)
      .join("");
    for (const read of [upside, latin(digits)]) {
      if (INNOCENT_READS.has(read)) continue;
      const found = prepared.en.find(({ form }) => form.length >= 4 && (read === form || read.startsWith(form)));
      if (found) return `${token} (${read})`;
    }
  }
  return undefined;
}

/**
 * Check a name or other short text a child has typed. This is a floor; a person should still review it.
 * @param text - Text to check.
 * @param options - Language (default all), maximum length in Unicode code points (default 40), and mode: "name" (the default:
 *   a name needs letters, so only numbers and marks are refused) or "text" (numbers allowed, still read for jokes).
 * @returns Whether it is clean, or the reason it needs attention.
 * @example
 * ```ts
 * import { checkText } from "@johnmorrisdotca/kotoba/children-filter";
 * console.log(checkText("Luna").ok); // true
 * ```
 */
export function checkText(text: string, options: Options = {}): Result {
  const normal = text.normalize("NFKC").trim();
  const max = options.maxLength ?? 40;
  if (!normal || [...normal].length > max) return { ok: false, reason: "shape" };
  if (contact(normal)) return { ok: false, reason: "personal" };
  const joke = numberJoke(normal);
  if (joke) return { ok: false, reason: "blocked", word: joke };
  if (personal(normal)) return { ok: false, reason: "personal" };
  // A name has letters: only numbers and marks ("007", "3.14") are not a name. Free text may hold numbers.
  if ((options.mode ?? "name") === "name" && !/\p{L}/u.test(normal)) return { ok: false, reason: "shape" };
  if (!/[\p{L}\p{N}]/u.test(normal) || /<[^>]*>/u.test(normal)) return { ok: false, reason: "shape" };
  const languages: Exclude<Language, "all">[] =
    options.lang && options.lang !== "all" ? [options.lang] : ["en", "ja", "fr", "de", "es", "it", "pt"];
  for (const language of languages) {
    const word = blocked(normal, language);
    if (word) return { ok: false, reason: "blocked", word };
  }
  return { ok: true };
}

/**
 * Say whether a name or short text passes the children's filter.
 * @param text - Text to check.
 * @param options - Language and maximum length, as for checkText.
 * @returns True if the text passes.
 * @example
 * ```ts
 * import { isClean } from "@johnmorrisdotca/kotoba/children-filter";
 * console.log(isClean("Luna")); // true
 * ```
 */
export function isClean(text: string, options?: Options): boolean {
  return checkText(text, options).ok;
}
