/**
 * MARKING A GUESS, the rule every five-letter word game shares: a letter in
 * its place is a hit, a letter the hidden word has elsewhere is near, and a
 * letter it does not have (or has fewer times than the guess) is a miss.
 */

/** The alphabet games: English, French, German, and the pop-culture English list.
 *
 * @example
 * ```ts
 * import type { GomojiLanguage } from "@johnmorrisdotca/kotoba";
 *
 * const value: GomojiLanguage = "fr";
 * console.log(value);
 * ```
 */
export type GomojiLanguage = "en" | "fr" | "de" | "pop";

/** How a guessed letter did: in its place, in the word elsewhere, or not in it.
 *
 * @example
 * ```ts
 * import type { LetterMark } from "@johnmorrisdotca/kotoba";
 *
 * const value: LetterMark = "near";
 * console.log(value);
 * ```
 */
export type LetterMark = "hit" | "near" | "miss";

/** The letters each alphabet game's words are written in, as a character class.
 *
 * @example
 * ```ts
 * import { ALPHABETS } from "@johnmorrisdotca/kotoba";
 * console.log(ALPHABETS);
 * ```
 */
export const ALPHABETS: Readonly<Record<GomojiLanguage, string>> = { en: "A-Z", fr: "A-Z", de: "A-ZÄÖÜ", pop: "A-Z" };

/** Each letter of a guess marked against the hidden word, counting a letter only as often as the word holds it.
 *
 * @param guess - The guessed word or kana array, with the same length as the hidden word.
 * @param hidden - The hidden word in native lowercase letters or kana.
 * @returns Each letter of a guess marked against the hidden word, counting a letter only as often as the word holds it.
 * @example
 * ```ts
 * import { markGuess } from "@johnmorrisdotca/kotoba";
 *
 * console.log(markGuess("alley","apple"));
 * ```
 */
export function markGuess(guess: string, hidden: string): LetterMark[] {
  const marks: LetterMark[] = Array.from({ length: guess.length }, () => "miss");
  const left = new Map<string, number>();
  for (let at = 0; at < hidden.length; at += 1) {
    if (guess[at] === hidden[at]) marks[at] = "hit";
    else left.set(hidden[at]!, (left.get(hidden[at]!) ?? 0) + 1);
  }
  for (let at = 0; at < guess.length; at += 1) {
    if (marks[at] === "hit") continue;
    const count = left.get(guess[at]!) ?? 0;
    if (count > 0) {
      marks[at] = "near";
      left.set(guess[at]!, count - 1);
    }
  }
  return marks;
}

/** A hidden word as it is written down for a puzzle: in capitals.
 *
 * @param word - The word or kana array specified by this signature.
 * @returns A hidden word as it is written down for a puzzle: in capitals.
 * @example
 * ```ts
 * import { encodeHidden } from "@johnmorrisdotca/kotoba";
 *
 * console.log(encodeHidden("apple"));
 * ```
 */
export function encodeHidden(word: string): string {
  return word.toUpperCase();
}

/** A hidden word read back, in lower case, or null for one that is not `size` letters of the language's alphabet.
 *
 * @param givens - The uppercase native hidden-word code.
 * @param size - The number of letters or kana in each word.
 * @param lang - The English, French or German alphabet.
 * @returns A hidden word read back, in lower case, or null for one that is not `size` letters of the language's alphabet.
 * @example
 * ```ts
 * import { decodeHidden } from "@johnmorrisdotca/kotoba";
 *
 * console.log(decodeHidden("APPLE",5));
 * ```
 */
export function decodeHidden(givens: string, size: number, lang: GomojiLanguage = "en"): string | null {
  const re = new RegExp(`^[${ALPHABETS[lang]}]+$`);
  return typeof givens === "string" && givens.length === size && re.test(givens) ? givens.toLowerCase() : null;
}

/** Guesses run together, `size` letters each, read back as a list; null for anything else.
 *
 * @param code - Guesses concatenated in lowercase, with size characters per guess.
 * @param size - The number of letters or kana in each word.
 * @param lang - The English, French or German alphabet.
 * @returns Guesses run together, `size` letters each, read back as a list; null for anything else.
 * @example
 * ```ts
 * import { decodeGuesses } from "@johnmorrisdotca/kotoba";
 *
 * console.log(decodeGuesses("alleyapple",5));
 * ```
 */
export function decodeGuesses(code: string, size: number, lang: GomojiLanguage = "en"): string[] | null {
  const re = new RegExp(`^[${ALPHABETS[lang].toLowerCase()}]*$`);
  if (typeof code !== "string" || code.length % size !== 0 || !re.test(code)) return null;
  return Array.from({ length: code.length / size }, (_, row) => code.slice(row * size, row * size + size));
}
