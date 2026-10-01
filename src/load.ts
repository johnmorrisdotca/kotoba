import { KANA_SIZES, readWordLists, unpack } from "./lists.ts";

/**
 * LOADING A WORD LIST BY NAME. Each list is a module of its own, so a page or a
 * program fetches only the list it reads: this asks for one by the language and
 * the size in letters (or kana) and gives it back read into words. A bundler
 * splits every list into a file of its own, and nothing is fetched until it is
 * asked for.
 */

/** The languages that have a list to load: English, French, German, and Japanese kana. */
export type WordListName = "en" | "fr" | "de" | "ja";

/** A list read into words: the easy answers inside the answers inside the words that may be guessed. A kana list also says which JMdict release it was made from. */
export type LoadedWordList = { easy: readonly string[]; answers: readonly string[]; allowed: ReadonlySet<string>; release?: string };

/** The lists, in the order they are named. */
export const WORD_LIST_NAMES: readonly WordListName[] = ["en", "fr", "de", "ja"];

/** The sizes each list comes in: four to six letters, or three to five kana. */
export const WORD_LIST_SIZES: Readonly<Record<WordListName, readonly number[]>> = { en: [4, 5, 6], fr: [4, 5, 6], de: [4, 5, 6], ja: KANA_SIZES };

/** One list of one size read into words, or null for a size the language has no list of. */
export async function loadWordList(name: WordListName, size: number): Promise<LoadedWordList | null> {
  if (!WORD_LIST_SIZES[name]?.includes(size)) return null;
  if (name === "en") return readWordLists((await import("./lists/words-en.data.ts")).EN_WORDS, size);
  if (name === "fr") return readWordLists((await import("./lists/words-fr.data.ts")).FR_WORDS, size);
  if (name === "de") return readWordLists((await import("./lists/words-de.data.ts")).DE_WORDS, size);
  if (size === 3) return unpack((await import("./lists/kana-3.data.ts")).JA_WORDS_3, 3);
  if (size === 4) return unpack((await import("./lists/kana-4.data.ts")).JA_WORDS_4, 4);
  return unpack((await import("./lists/kana-5.data.ts")).JA_WORDS_5, 5);
}
