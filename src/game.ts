import { cycleMark, kanaFound, markKanaGuess, toggleSize } from "./kana/kanaMarks.ts";
import { kanaScore } from "./kana/kanaScore.ts";
import { finishRomaji, readRomaji } from "./kana/romaji.ts";
import { KEYBOARD_ROWS } from "./keyboardRows.ts";
import { markGuess, type GomojiLanguage, type LetterMark } from "./marks.ts";
import { wordScore, type WordScore } from "./wordScore.ts";

/**
 * A ROUND OF A WORD GAME, as plain data: a hidden word, the guesses made, the
 * word being typed, and how it stands. Every function returns a new round and
 * leaves the one it was given untouched, so a round can be kept in any
 * framework's state, replayed from its guesses, or played by a program.
 *
 * Letters are typed one key at a time. Kana are typed in romaji, which
 * `readRomaji` turns into kana as it can (`pending` holds the romaji not yet a
 * kana), and the size and mark of the last kana can be changed (`changeKana`).
 * The hidden word is the caller's to choose: from a list with `dailyWord`, at
 * random, or typed in by a friend.
 */

/** The languages a round is played in: the alphabet ones and Japanese kana.
 *
 * @example
 * ```ts
 * import type { WordGameLanguage } from "@johnmorrisdotca/kotoba";
 *
 * const value: WordGameLanguage = "ja";
 * console.log(value);
 * ```
 */
export type WordGameLanguage = GomojiLanguage | "ja";

/** How a round stands: still being played, found, or out of guesses.
 *
 * @example
 * ```ts
 * import type { WordGameStatus } from "@johnmorrisdotca/kotoba";
 *
 * const value: WordGameStatus = "playing";
 * console.log(value);
 * ```
 */
export type WordGameStatus = "playing" | "won" | "lost";

/** A round.
 *
 * @example
 * ```ts
 * import { startWordGame } from "@johnmorrisdotca/kotoba";
 * import type { WordGame } from "@johnmorrisdotca/kotoba";
 *
 * const game = startWordGame("en",5,"apple");
 * const value: WordGame = game;
 * console.log(value);
 * ```
 */
export type WordGame = {
  language: WordGameLanguage;
  /** How many letters, or kana, the word has. */
  size: number;
  /** How many guesses the round gives. */
  rows: number;
  /** The word to find. */
  hidden: string;
  /** The guesses made, each a whole word. */
  guesses: readonly string[];
  /** The letters, or kana, of the guess being typed. */
  typed: readonly string[];
  /** Romaji typed and not yet a kana: `k` waiting for a vowel. Always empty for letters. */
  pending: string;
  status: WordGameStatus;
  /** When the first key was pressed, in milliseconds, or null before it. */
  startedAt: number | null;
  /** The score, once the round is over. */
  score: WordScore | null;
};

/** The guesses a round gives unless said.
 *
 * @example
 * ```ts
 * import { WORD_GAME_ROWS } from "@johnmorrisdotca/kotoba";
 * console.log(WORD_GAME_ROWS);
 * ```
 */
export const WORD_GAME_ROWS = 6;

/** Why a guess was not taken: it was too short, or the list does not have the word.
 *
 * @example
 * ```ts
 * import type { WordGameRefusal } from "@johnmorrisdotca/kotoba";
 *
 * const value: WordGameRefusal = "not-a-word";
 * console.log(value);
 * ```
 */
export type WordGameRefusal = "too-short" | "not-a-word";

/** A guess sent in: the round after it, and why the guess was not taken, if it was not.
 *
 * @example
 * ```ts
 * import { readWordLists, startWordGame, submitWordGame, typeWordGame } from "@johnmorrisdotca/kotoba";
 * import { EN_WORDS } from "@johnmorrisdotca/kotoba/words-en";
 * import type { WordGameSubmit } from "@johnmorrisdotca/kotoba";
 *
 * const wordLists = readWordLists(EN_WORDS,5)!;
 * const game = startWordGame("en",5,"apple");
 * const typed = [..."apple"].reduce((state,key)=>typeWordGame(state,key,1000),game);
 * const submitted = submitWordGame(typed,wordLists,20000);
 * const value: WordGameSubmit = submitted;
 * console.log(value);
 * ```
 */
export type WordGameSubmit = { game: WordGame; refused: WordGameRefusal | null };

/** One place of a marked guess: how it did, and for kana whether its size or mark is wrong.
 *
 * @example
 * ```ts
 * import type { PlaceMark } from "@johnmorrisdotca/kotoba";
 *
 * const value: PlaceMark = {mark:"near",wrongSize:false,wrongMark:false};
 * console.log(value);
 * ```
 */
export type PlaceMark = { mark: LetterMark | "kin"; wrongSize: boolean; wrongMark: boolean };

/** The words a round may be guessed from. `answers` is checked as well as `allowed`, for a list whose answers may not all be in `allowed`.
 *
 * @example
 * ```ts
 * import { readWordLists } from "@johnmorrisdotca/kotoba";
 * import { EN_WORDS } from "@johnmorrisdotca/kotoba/words-en";
 * import type { WordGameWords } from "@johnmorrisdotca/kotoba";
 *
 * const wordLists = readWordLists(EN_WORDS,5)!;
 * const value: WordGameWords = wordLists;
 * console.log(value);
 * ```
 */
export type WordGameWords = { allowed: ReadonlySet<string>; answers?: readonly string[] };

/** Whether a round is played in kana.
 *
 * @param game - The current immutable word-game state.
 * @returns Whether a round is played in kana.
 * @example
 * ```ts
 * import { isKanaGame, startWordGame } from "@johnmorrisdotca/kotoba";
 *
 * const game = startWordGame("en",5,"apple");
 * console.log(isKanaGame(game));
 * ```
 */
export const isKanaGame = (game: Pick<WordGame, "language">): boolean => game.language === "ja";

/** A new round: nothing guessed, nothing typed. The hidden word is as the list gives it (lower case letters, or kana).
 *
 * @param language - The native game language.
 * @param size - The number of letters or kana in each word.
 * @param hidden - The hidden word in native lowercase letters or kana.
 * @param rows - The number of guesses the game permits.
 * @returns A new round: nothing guessed, nothing typed. The hidden word is as the list gives it (lower case letters, or kana).
 * @example
 * ```ts
 * import { startWordGame } from "@johnmorrisdotca/kotoba";
 *
 * console.log(startWordGame("en",5,"apple").status);
 * ```
 */
export function startWordGame(language: WordGameLanguage, size: number, hidden: string, rows = WORD_GAME_ROWS): WordGame {
  return { language, size, rows, hidden, guesses: [], typed: [], pending: "", status: "playing", startedAt: null, score: null };
}

/** The keys a round accepts, by the character each types: the letters of the language's keyboard, and for kana the letters of romaji and the long-vowel bar.
 *
 * @param language - The native game language.
 * @returns The keys a round accepts, by the character each types: the letters of the language's keyboard, and for kana the letters of romaji and the long-vowel bar.
 * @example
 * ```ts
 * import { wordGameKeys } from "@johnmorrisdotca/kotoba";
 *
 * console.log(wordGameKeys("en"));
 * ```
 */
export function wordGameKeys(language: WordGameLanguage): string {
  return language === "ja" ? "abcdefghijklmnopqrstuvwxyz-" : KEYBOARD_ROWS[language].join("");
}

/** One key typed, `now` being the time in milliseconds (the first key starts the clock). A key the round does not take, or a round that is over, changes nothing.
 *
 * @param game - The current immutable word-game state.
 * @param key - One accepted keyboard character.
 * @param now - Host clock time in milliseconds.
 * @returns One key typed, `now` being the time in milliseconds (the first key starts the clock). A key the round does not take, or a round that is over, changes nothing.
 * @example
 * ```ts
 * import { startWordGame, typeWordGame } from "@johnmorrisdotca/kotoba";
 *
 * const game = startWordGame("en",5,"apple");
 * const typed = [..."apple"].reduce((state,key)=>typeWordGame(state,key,1000),game);
 * console.log(typeWordGame(game,"a",1000).typed);
 * ```
 */
export function typeWordGame(game: WordGame, key: string, now = Date.now()): WordGame {
  if (game.status !== "playing" || key.length !== 1 || !wordGameKeys(game.language).includes(key)) return game;
  const started = game.startedAt ?? now;
  if (isKanaGame(game)) {
    if (game.typed.length >= game.size) return game;
    const read = readRomaji(game.pending + key);
    return { ...game, startedAt: started, typed: [...game.typed, ...read.kana].slice(0, game.size), pending: read.rest };
  }
  return game.typed.length < game.size ? { ...game, startedAt: started, typed: [...game.typed, key] } : game;
}

/** The last thing typed taken back: romaji not yet a kana first, then the last kana or letter.
 *
 * @param game - The current immutable word-game state.
 * @returns The last thing typed taken back: romaji not yet a kana first, then the last kana or letter.
 * @example
 * ```ts
 * import { eraseWordGame, startWordGame, typeWordGame } from "@johnmorrisdotca/kotoba";
 *
 * const game = startWordGame("en",5,"apple");
 * const typed = [..."apple"].reduce((state,key)=>typeWordGame(state,key,1000),game);
 * console.log(eraseWordGame(typed).typed);
 * ```
 */
export function eraseWordGame(game: WordGame): WordGame {
  if (game.status !== "playing") return game;
  if (isKanaGame(game) && game.pending !== "") return { ...game, pending: game.pending.slice(0, -1) };
  return { ...game, typed: game.typed.slice(0, -1) };
}

/** The last kana typed made small or large again (つ and っ), or given the next mark (は, ば, ぱ). Letters have neither: nothing changes.
 *
 * @param game - The current immutable word-game state.
 * @param change - Toggle the final kana size or cycle its voicing mark.
 * @returns The last kana typed made small or large again (つ and っ), or given the next mark (は, ば, ぱ). Letters have neither: nothing changes.
 * @example
 * ```ts
 * import { changeWordGame, startWordGame, typeWordGame } from "@johnmorrisdotca/kotoba";
 *
 * const game = startWordGame("en",5,"apple");
 * const typed = [..."apple"].reduce((state,key)=>typeWordGame(state,key,1000),game);
 * console.log(changeWordGame(startWordGame("ja",2,"はな"),"mark").typed);
 * ```
 */
export function changeWordGame(game: WordGame, change: "size" | "mark"): WordGame {
  if (game.status !== "playing" || !isKanaGame(game) || game.typed.length === 0) return game;
  const last = game.typed[game.typed.length - 1] as string;
  return { ...game, typed: [...game.typed.slice(0, -1), change === "size" ? toggleSize(last) : cycleMark(last)] };
}

/** How each place of a guess did against the hidden word. For letters `wrongSize` and `wrongMark` are false.
 *
 * @param game - The current immutable word-game state.
 * @param guess - The guessed word or kana array, with the same length as the hidden word.
 * @returns How each place of a guess did against the hidden word. For letters `wrongSize` and `wrongMark` are false.
 * @example
 * ```ts
 * import { guessMarks, startWordGame } from "@johnmorrisdotca/kotoba";
 *
 * const game = startWordGame("en",5,"apple");
 * console.log(guessMarks(game,"alley"));
 * ```
 */
export function guessMarks(game: Pick<WordGame, "language" | "hidden">, guess: string): PlaceMark[] {
  if (game.language === "ja") return markKanaGuess([...guess], [...game.hidden]).map((one) => ({ mark: one.mark, wrongSize: one.wrongSize, wrongMark: one.wrongMark }));
  return markGuess(guess, game.hidden).map((mark) => ({ mark, wrongSize: false, wrongMark: false }));
}

/**
 * The best mark each letter has earned across the guesses, for colouring a
 * keyboard: a hit beats near beats miss. Kana have no such keyboard, so a kana
 * round answers with nothing.
 *
 * @param game - The current immutable word-game state.
 * @returns The best mark each letter has earned across the guesses, for colouring a keyboard: a hit beats near beats miss. Kana have no such keyboard, so a kana round answers with nothing.
 * @example
 * ```ts
 * import { keyMarks, readWordLists, startWordGame, submitWordGame, typeWordGame } from "@johnmorrisdotca/kotoba";
 * import { EN_WORDS } from "@johnmorrisdotca/kotoba/words-en";
 *
 * const wordLists = readWordLists(EN_WORDS,5)!;
 * const game = startWordGame("en",5,"apple");
 * const typed = [..."apple"].reduce((state,key)=>typeWordGame(state,key,1000),game);
 * const submitted = submitWordGame(typed,wordLists,20000);
 * console.log([...keyMarks(submitted.game)]);
 * ```
 */
export function keyMarks(game: WordGame): Map<string, LetterMark> {
  const best = new Map<string, LetterMark>();
  if (isKanaGame(game)) return best;
  const rank: Record<LetterMark, number> = { hit: 3, near: 2, miss: 1 };
  for (const guess of game.guesses) {
    guessMarks(game, guess).forEach((one, place) => {
      const letter = guess[place] as string;
      const mark = one.mark as LetterMark;
      if (rank[mark] > (best.has(letter) ? rank[best.get(letter) as LetterMark] : 0)) best.set(letter, mark);
    });
  }
  return best;
}

/**
 * The guess being typed sent in, `now` being the time in milliseconds. Kana
 * still waiting as romaji are finished first (`finishRomaji`). A guess that is
 * too short, or not in the list, is not taken: the round comes back with what
 * was typed kept, and says why. A guess that is taken ends the round when it is
 * the hidden word or the last guess, and the round is then scored.
 *
 * @param game - The current immutable word-game state.
 * @param words - The ordered nonempty word pool or accepted-guess dictionary specified by the signature.
 * @param now - Host clock time in milliseconds.
 * @returns The guess being typed sent in, `now` being the time in milliseconds. Kana still waiting as romaji are finished first (`finishRomaji`). A guess that is too short, or not in the list, is not taken: the round comes back with what was typed kept, and says why. A guess that is taken ends the round when it is the hidden word or the last guess, and the round is then scored.
 * @example
 * ```ts
 * import { readWordLists, startWordGame, submitWordGame, typeWordGame } from "@johnmorrisdotca/kotoba";
 * import { EN_WORDS } from "@johnmorrisdotca/kotoba/words-en";
 *
 * const wordLists = readWordLists(EN_WORDS,5)!;
 * const game = startWordGame("en",5,"apple");
 * const typed = [..."apple"].reduce((state,key)=>typeWordGame(state,key,1000),game);
 * const submitted = submitWordGame(typed,wordLists,20000);
 * console.log(submitted);
 * ```
 */
export function submitWordGame(game: WordGame, words: WordGameWords, now = Date.now()): WordGameSubmit {
  if (game.status !== "playing") return { game, refused: null };
  const kana = isKanaGame(game);
  const typed = kana ? [...game.typed, ...finishRomaji(game.pending)].slice(0, game.size) : game.typed;
  const settled = { ...game, typed, pending: "" };
  if (typed.length < game.size) return { game: settled, refused: "too-short" };
  const word = typed.join("");
  if (!words.allowed.has(word) && !(words.answers ?? []).includes(word)) return { game: settled, refused: "not-a-word" };
  const guesses = [...game.guesses, word];
  const found = kana ? kanaFound(typed, [...game.hidden]) : word === game.hidden;
  const over = found || guesses.length >= game.rows;
  const elapsed = Math.max(0, now - (game.startedAt ?? now));
  const score = over ? (kana ? kanaScore(game.hidden, guesses, game.rows, elapsed) : wordScore(game.hidden, guesses, game.rows, elapsed)) : null;
  return { game: { ...settled, guesses, typed: [], status: over ? (found ? "won" : "lost") : "playing", score }, refused: null };
}
