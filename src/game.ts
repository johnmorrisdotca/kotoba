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

/** The languages a round is played in: the alphabet ones and Japanese kana. */
export type WordGameLanguage = GomojiLanguage | "ja";

/** How a round stands: still being played, found, or out of guesses. */
export type WordGameStatus = "playing" | "won" | "lost";

/** A round. */
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

/** The guesses a round gives unless said. */
export const WORD_GAME_ROWS = 6;

/** Why a guess was not taken: it was too short, or the list does not have the word. */
export type WordGameRefusal = "too-short" | "not-a-word";

/** A guess sent in: the round after it, and why the guess was not taken, if it was not. */
export type WordGameSubmit = { game: WordGame; refused: WordGameRefusal | null };

/** One place of a marked guess: how it did, and for kana whether its size or mark is wrong. */
export type PlaceMark = { mark: LetterMark | "kin"; wrongSize: boolean; wrongMark: boolean };

/** The words a round may be guessed from. `answers` is checked as well as `allowed`, for a list whose answers may not all be in `allowed`. */
export type WordGameWords = { allowed: ReadonlySet<string>; answers?: readonly string[] };

/** Whether a round is played in kana. */
export const isKanaGame = (game: Pick<WordGame, "language">): boolean => game.language === "ja";

/** A new round: nothing guessed, nothing typed. The hidden word is as the list gives it (lower case letters, or kana). */
export function startWordGame(language: WordGameLanguage, size: number, hidden: string, rows = WORD_GAME_ROWS): WordGame {
  return { language, size, rows, hidden, guesses: [], typed: [], pending: "", status: "playing", startedAt: null, score: null };
}

/** The keys a round accepts, by the character each types: the letters of the language's keyboard, and for kana the letters of romaji and the long-vowel bar. */
export function wordGameKeys(language: WordGameLanguage): string {
  return language === "ja" ? "abcdefghijklmnopqrstuvwxyz-" : KEYBOARD_ROWS[language].join("");
}

/** One key typed, `now` being the time in milliseconds (the first key starts the clock). A key the round does not take, or a round that is over, changes nothing. */
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

/** The last thing typed taken back: romaji not yet a kana first, then the last kana or letter. */
export function eraseWordGame(game: WordGame): WordGame {
  if (game.status !== "playing") return game;
  if (isKanaGame(game) && game.pending !== "") return { ...game, pending: game.pending.slice(0, -1) };
  return { ...game, typed: game.typed.slice(0, -1) };
}

/** The last kana typed made small or large again (つ and っ), or given the next mark (は, ば, ぱ). Letters have neither: nothing changes. */
export function changeWordGame(game: WordGame, change: "size" | "mark"): WordGame {
  if (game.status !== "playing" || !isKanaGame(game) || game.typed.length === 0) return game;
  const last = game.typed[game.typed.length - 1] as string;
  return { ...game, typed: [...game.typed.slice(0, -1), change === "size" ? toggleSize(last) : cycleMark(last)] };
}

/** How each place of a guess did against the hidden word. For letters `wrongSize` and `wrongMark` are false. */
export function guessMarks(game: Pick<WordGame, "language" | "hidden">, guess: string): PlaceMark[] {
  if (game.language === "ja") return markKanaGuess([...guess], [...game.hidden]).map((one) => ({ mark: one.mark, wrongSize: one.wrongSize, wrongMark: one.wrongMark }));
  return markGuess(guess, game.hidden).map((mark) => ({ mark, wrongSize: false, wrongMark: false }));
}

/**
 * The best mark each letter has earned across the guesses, for colouring a
 * keyboard: a hit beats near beats miss. Kana have no such keyboard, so a kana
 * round answers with nothing.
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
