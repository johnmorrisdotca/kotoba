import { de, en, fr, ja } from "./childrenWords.ts";

type Language = "en" | "ja" | "fr" | "de" | "all";
type Options = { lang?: Language; maxLength?: number };
type Result = { ok: true } | { ok: false; reason: "blocked" | "personal" | "shape"; word?: string };

const lists = { en, fr, de, ja };
const leet: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
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
    .replace(/[0134578@$!|+]/g, (c) => leet[c] ?? c);
const kana = (text: string) =>
  text
    .normalize("NFKC")
    .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 96))
    .replace(/[\s　・･.,、。_\-ー~〜]/g, "");
const personal = (text: string) =>
  /[^\s@]+@[^\s@]+\.[^\s@]+|https?:|www\.|\.[a-z]{2,6}(?:\/|$)|\.(?:com|net|org|jp|ca|io|co)\b|\d{4,}|(?:\+?\d[\s().-]*){7,}|\b\d+\s+[\p{L}][\p{L}\s.'-]*\s(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd)\b/iu.test(
    text.normalize("NFKC"),
  );
/** Barred words that are also ordinary given names, so a child's own name passes (John, 2026-11-09); "dickhead" stays barred. */
const NAMES = new Set(["dick"]);

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
  for (const { word, form } of prepared[language]) {
    const single = form.replace(/(.)\1+/g, "$1");
    if (
      words.some((part) => part === form || part === `${form}s` || part === `${form}es`) ||
      stretched.some((part, i) => words[i] !== part && part === single)
    )
      return word;
    if (words.length > 1 && compact === form) return word;
    // This common profession is not an embedded assault term.
    if (
      form.length >= 5 &&
      compact.includes(form) &&
      !NAMES.has(form.replace(/s$/, "")) &&
      !(form === "rapist" && compact === "therapist")
    )
      return word;
  }
  return undefined;
}

/**
 * Check a name or other short text a child has typed. This is a floor; a person should still review it.
 * @param text - Text to check.
 * @param options - Language (default all) and maximum length in Unicode code points (default 40).
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
  if (personal(normal)) return { ok: false, reason: "personal" };
  if (!/[\p{L}\p{N}]/u.test(normal) || /<[^>]*>/u.test(normal)) return { ok: false, reason: "shape" };
  const languages: Exclude<Language, "all">[] =
    options.lang && options.lang !== "all" ? [options.lang] : ["en", "ja", "fr", "de"];
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
