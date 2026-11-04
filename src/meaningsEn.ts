import type { WordListName } from "./load.ts";

/**
 * WHAT AN ENGLISH WORD MEANS, from Open English WordNet (CC BY 4.0, derived from Princeton WordNet). Kotoba's board takes a
 * `meanings(word, words)` function and holds no dictionary of its own; this is one a page may hand it for the English lists.
 * Each length of word has a module of its own, fetched when a word of that length is asked about, so a page loads the meanings
 * of the length it plays and nothing else.
 */

/**
 * The meanings of one length of word as a data file holds them: the release it was made from, and a row to a line, each the word,
 * a tab and the line.
 *
 * @example
 * ```ts
 * import type { PackedMeanings } from "@johnmorrisdotca/kotoba/meanings-en";
 *
 * const packed: PackedMeanings = { release: "2025", rows: "crane\tlifts and moves heavy objects" };
 * console.log(packed.release);
 * ```
 */
export type PackedMeanings = {
  /** The Open English WordNet release it was made from. */
  readonly release: string;
  /** One row to a line: the word, a tab, and a short line saying what it means. */
  readonly rows: string;
};

/**
 * Reads a stored list of meanings into a map from word to line.
 *
 * @param packed - `EN_MEANINGS_5` and the like, from the lists' modules, or a table of your own in the same shape.
 * @returns Each word's line.
 * @example
 * ```ts
 * import { readMeanings } from "@johnmorrisdotca/kotoba/meanings-en";
 *
 * console.log(readMeanings({ release: "x", rows: "crane\tlifts and moves heavy objects" }).get("crane"));
 * ```
 */
export function readMeanings(packed: PackedMeanings): Map<string, string> {
  return new Map(
    packed.rows.split("\n").map((row) => {
      const at = row.indexOf("\t");
      return [row.slice(0, at), row.slice(at + 1)] as const;
    }),
  );
}

const pieces: Record<number, () => Promise<PackedMeanings>> = {
  4: () => import("./lists/meanings-en-4.data.ts").then((one) => one.EN_MEANINGS_4),
  5: () => import("./lists/meanings-en-5.data.ts").then((one) => one.EN_MEANINGS_5),
  6: () => import("./lists/meanings-en-6.data.ts").then((one) => one.EN_MEANINGS_6),
};
const read = new Map<number, Promise<Map<string, string>>>();

/**
 * What an English word means, in a short line, or null for a word with no meaning to show: one WordNet has no entry for, a
 * word of the other languages, or one left out because it is not for children. The shape is the board's `meanings` option.
 *
 * @param word - The word, in any case.
 * @param words - The list the word is from; any but `"en"` has no meanings here and gives null.
 * @returns The line, such as "lifts and moves heavy objects", or "plural of cow: …" for a plural, or null.
 * @example
 * ```ts
 * import { englishMeaning } from "@johnmorrisdotca/kotoba/meanings-en";
 *
 * console.log(await englishMeaning("crane"));
 * ```
 */
export async function englishMeaning(word: string, words: WordListName = "en"): Promise<string | null> {
  const piece = pieces[word.length];
  if (words !== "en" || piece === undefined) return null;
  let table = read.get(word.length);
  if (table === undefined) {
    table = piece().then(readMeanings);
    read.set(word.length, table);
  }
  return (await table).get(word.toLowerCase()) ?? null;
}
