/**
 * THE WORD LISTS AS THEY ARE KEPT, and read. Each list is an entry point of its
 * own (`@johnmorrisdotca/kotoba/words-en`, `/kana-5`, …), so a page fetches
 * only the list it plays; this module reads one once it is loaded.
 */

/** The languages with a dictionary of their own: English, French and German. */
export type WordListLanguage = "en" | "fr" | "de";

/** An alphabet list as its entry point exports it: for each length, the easy answers, all the answers and every word that may be guessed, each a run of words between spaces. */
export type WordData = Record<number, { easy: string; answers: string; allowed: string }>;

/** One length of an alphabet list, read: the easy answers, every answer, and the words that may be guessed. */
export type WordLists = { easy: readonly string[]; answers: readonly string[]; allowed: ReadonlySet<string> };

/** One length of a list read into words, or null for a length the list does not have. */
export function readWordLists(data: WordData, size: number): WordLists | null {
  const text = data[size];
  if (text === undefined) return null;
  const split = (words: string) => words.split(/\s+/).filter(Boolean);
  return { easy: split(text.easy), answers: split(text.answers), allowed: new Set(split(text.allowed)) };
}

/** The lengths the kana lists come in. */
export const KANA_SIZES = [3, 4, 5] as const;

/** A kana list as its entry point exports it: the JMdict release, an alphabet of kana and one character a kana for each, and the three lists written in those characters. */
export type Packed = { release: string; alphabet: string; codes: string; easy: string; answers: string; allowed: string };

/** A kana list, read. */
export type KanaWords = {
  /** The JMdict release the list was made from, for the credit on the page. */
  release: string;
  easy: readonly string[];
  answers: readonly string[];
  allowed: ReadonlySet<string>;
};

/** A packed kana list read into its words, `size` kana each. */
export function unpack(packed: Packed, size: number): KanaWords {
  const kanaOf = new Map([...packed.codes].map((code, at) => [code, packed.alphabet[at]!]));
  const words = (run: string) => {
    const chars = [...run];
    return Array.from({ length: chars.length / size }, (_, at) => chars.slice(at * size, at * size + size).map((code) => kanaOf.get(code) ?? "").join(""));
  };
  return { release: packed.release, easy: words(packed.easy), answers: words(packed.answers), allowed: new Set(words(packed.allowed)) };
}
