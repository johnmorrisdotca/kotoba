/**
 * WHAT THE KANA BUILD KEEPS AND WHAT IT BARS (scripts/word-lists-ja.mjs).
 *
 * A word that may be guessed stays so: a game somebody played, kept or half way through, was checked against the list
 * as it was, so a word JMdict stops listing (やまま, ふかいきり in the release of 2026-11) is never taken away from the
 * lists. The one way out is the bar: a reading no ordinary meaning is left for, because every entry that spells it has
 * JMdict's mark for vulgar, X-rated, sensitive or derogatory on its first sense, or a first-sense gloss that names sex or
 * the sex trade, the rule every list uses (scripts/children-bar.mjs). Children play these games.
 */
import { japaneseBar } from "./children-bar.mjs";

/** Whether an entry's first sense is not for children: its main meaning is the unfit one (`children-bar.mjs`). */
export const firstSenseNotForEveryone = (entry) => japaneseBar(entry, "first") !== null;

/** The words a kana list file may guess, read back from the file the last build wrote. */
export function readAllowed(text, length) {
  const field = (name) => new RegExp(`\\n  ${name}: "([^"]*)"`).exec(text)?.[1];
  const alphabet = [...field("alphabet")];
  const codes = [...field("codes")];
  const kana = new Map(codes.map((code, at) => [code, alphabet[at]]));
  const chars = [...field("allowed")];
  const words = new Set();
  for (let at = 0; at < chars.length; at += length)
    words.add(
      chars
        .slice(at, at + length)
        .map((char) => kana.get(char))
        .join(""),
    );
  return words;
}

/**
 * The words that may be guessed: those before and those JMdict lists now, less the barred. A word is never left out for
 * having gone from JMdict, only for being barred.
 */
export function keepGuessable({ before, fresh, barred }) {
  return new Set([...before, ...fresh].filter((word) => !barred.has(word)));
}
