/**
 * Shiritori, the Japanese word chain: each word starts on the kana the last one
 * ended on, and a word ending in ん loses, because no Japanese word starts on it.
 * Plain functions over readings, so a game can use any pool of words: the list at
 * `@johnmorrisdotca/kotoba/shiritori-ja`, or the words one learner has met.
 */

const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const KATAKANA_TO_HIRAGANA = 0x60;
const LONG_VOWEL_MARK = "ー";
const CHAIN_ENDS = "ん";

const SMALL_TO_LARGE: Readonly<Record<string, string>> = {
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ",
  ゎ: "わ",
  っ: "つ",
};

const VOICED_TO_PLAIN: Readonly<Record<string, string>> = {
  が: "か",
  ぎ: "き",
  ぐ: "く",
  げ: "け",
  ご: "こ",
  ざ: "さ",
  じ: "し",
  ず: "す",
  ぜ: "せ",
  ぞ: "そ",
  だ: "た",
  ぢ: "ち",
  づ: "つ",
  で: "て",
  ど: "と",
  ば: "は",
  び: "ひ",
  ぶ: "ふ",
  べ: "へ",
  ぼ: "ほ",
  ぱ: "は",
  ぴ: "ひ",
  ぷ: "ふ",
  ぺ: "へ",
  ぽ: "ほ",
  ゔ: "う",
};

const VOWEL_OF: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries({
    あ: "あかさたなはまやらわ",
    い: "いきしちにひみり",
    う: "うくすつぬふむゆる",
    え: "えけせてねへめれ",
    お: "おこそとのほもよろを",
  }).flatMap(([vowel, row]) => [...row].map((kana) => [kana, vowel])),
);

/**
 * House rules, since no two tables play alike. The defaults are the forgiving
 * ones, which keep a chain going from a small pool of words.
 *
 * @example
 * ```ts
 * import type { ShiritoriRules } from "@johnmorrisdotca/kotoba";
 *
 * const strict: ShiritoriRules = { voicing: "kept", longVowel: "before" };
 * console.log(strict);
 * ```
 */
export type ShiritoriRules = {
  /** `"ignored"` (the default): が chains from か. `"kept"`: only from が. */
  readonly voicing?: "ignored" | "kept";
  /** What a final ー chains on. `"vowel"` (the default): コーヒー chains on い. `"before"`: on ひ. */
  readonly longVowel?: "vowel" | "before";
};

const isPlain = (kana: string) => kana in VOWEL_OF || kana === CHAIN_ENDS;

/**
 * A reading folded to hiragana, with anything that is not kana or a long vowel mark dropped.
 *
 * @param reading - The reading, in hiragana or katakana.
 * @returns The reading in hiragana.
 * @example
 * ```ts
 * import { normalizeShiritoriReading } from "@johnmorrisdotca/kotoba";
 *
 * console.log(normalizeShiritoriReading("コーヒー")); // こーひー
 * ```
 */
export function normalizeShiritoriReading(reading: string): string {
  let out = "";
  for (const character of reading.trim()) {
    const code = character.codePointAt(0) ?? 0;
    const kana =
      code >= KATAKANA_START && code <= KATAKANA_END ? String.fromCodePoint(code - KATAKANA_TO_HIRAGANA) : character;
    if (kana === LONG_VOWEL_MARK || isPlain(kana) || kana in SMALL_TO_LARGE || kana in VOICED_TO_PLAIN) out += kana;
  }
  return out;
}

/** The key one kana is compared on at either end of a word, or null for one that cannot chain. */
function keyOf(kana: string, rules: ShiritoriRules): string | null {
  const large = SMALL_TO_LARGE[kana] ?? kana;
  const plain = VOICED_TO_PLAIN[large] ?? large;
  if (!isPlain(plain)) return null;
  return rules.voicing === "kept" ? large : plain;
}

/**
 * The kana the next word must start on, or null when the word ends the chain: it ends in ん, or holds no kana.
 *
 * @param reading - The reading of the word just played.
 * @param rules - House rules; the forgiving ones if left out.
 * @returns The key the next word's head must equal, or null.
 * @example
 * ```ts
 * import { shiritoriTailKey } from "@johnmorrisdotca/kotoba";
 *
 * console.log(shiritoriTailKey("さくら"), shiritoriTailKey("コーヒー"), shiritoriTailKey("みかん")); // ら い null
 * ```
 */
export function shiritoriTailKey(reading: string, rules: ShiritoriRules = {}): string | null {
  const kana = [...normalizeShiritoriReading(reading)];
  for (let at = kana.length - 1; at >= 0; at -= 1) {
    if (kana[at] === LONG_VOWEL_MARK) {
      for (let back = at - 1; back >= 0; back -= 1) {
        const key = keyOf(kana[back] as string, rules);
        if (key === null || key === CHAIN_ENDS) continue;
        return rules.longVowel === "before" ? key : (VOWEL_OF[VOICED_TO_PLAIN[key] ?? key] ?? null);
      }
      return null;
    }
    const key = keyOf(kana[at] as string, rules);
    if (key !== null) return key === CHAIN_ENDS ? null : key;
  }
  return null;
}

/**
 * The kana a reading starts on, or null when it holds none.
 *
 * @param reading - The reading of a word.
 * @param rules - House rules; the forgiving ones if left out.
 * @returns The key to compare against the last word's tail, or null.
 * @example
 * ```ts
 * import { shiritoriHeadKey } from "@johnmorrisdotca/kotoba";
 *
 * console.log(shiritoriHeadKey("がっこう"), shiritoriHeadKey("がっこう", { voicing: "kept" })); // か が
 * ```
 */
export function shiritoriHeadKey(reading: string, rules: ShiritoriRules = {}): string | null {
  for (const kana of normalizeShiritoriReading(reading)) {
    const key = keyOf(kana, rules);
    if (key !== null) return key;
  }
  return null;
}

/**
 * Whether a word starts on the kana the chain has reached.
 *
 * @param reading - The reading of the word.
 * @param chainKey - The last word's tail key.
 * @param rules - House rules; the forgiving ones if left out.
 * @returns Whether the word continues the chain, wherever it then leads.
 * @example
 * ```ts
 * import { shiritoriReadingContinues } from "@johnmorrisdotca/kotoba";
 *
 * console.log(shiritoriReadingContinues("らくだ", "ら"));
 * ```
 */
export function shiritoriReadingContinues(reading: string, chainKey: string, rules: ShiritoriRules = {}): boolean {
  return shiritoriHeadKey(reading, rules) === chainKey;
}

/**
 * Whether a word continues the chain and does not end it.
 *
 * @param reading - The reading of the word.
 * @param chainKey - The last word's tail key.
 * @param rules - House rules; the forgiving ones if left out.
 * @returns Whether the word can be played without losing.
 * @example
 * ```ts
 * import { shiritoriReadingIsPlayable } from "@johnmorrisdotca/kotoba";
 *
 * console.log(shiritoriReadingIsPlayable("らくだ", "ら"), shiritoriReadingIsPlayable("らいおん", "ら"));
 * ```
 */
export function shiritoriReadingIsPlayable(reading: string, chainKey: string, rules: ShiritoriRules = {}): boolean {
  return shiritoriReadingContinues(reading, chainKey, rules) && shiritoriTailKey(reading, rules) !== null;
}

/**
 * How tempting a word that does not continue the chain is, for a game offering wrong answers: 0 for a word that does
 * continue, or holds no kana; 1 for any other; more for one that shares the vowel, or that ends where the chain stands.
 *
 * @param reading - The reading of the wrong answer.
 * @param chainKey - The last word's tail key.
 * @param rules - House rules; the forgiving ones if left out.
 * @returns The score: higher is harder to refuse at speed.
 * @example
 * ```ts
 * import { shiritoriDistractorScore } from "@johnmorrisdotca/kotoba";
 *
 * console.log(shiritoriDistractorScore("かわ", "さ"), shiritoriDistractorScore("きのこ", "さ"));
 * ```
 */
export function shiritoriDistractorScore(reading: string, chainKey: string, rules: ShiritoriRules = {}): number {
  const head = shiritoriHeadKey(reading, rules);
  if (head === null || head === chainKey) return 0;
  const vowel = (kana: string) => VOWEL_OF[VOICED_TO_PLAIN[kana] ?? kana];
  let score = 1;
  if (vowel(head) !== undefined && vowel(head) === vowel(chainKey)) score += 3;
  if (shiritoriTailKey(reading, rules) === chainKey) score += 2;
  return score;
}

/**
 * Why a word was refused: it starts on the wrong kana, holds no kana, or was said already. A word ending in ん is not
 * refused; it is played and it loses (`loses`).
 *
 * @example
 * ```ts
 * import type { ShiritoriRefusal } from "@johnmorrisdotca/kotoba";
 *
 * const why: ShiritoriRefusal = "repeated";
 * console.log(why);
 * ```
 */
export type ShiritoriRefusal = "not-kana" | "wrong-start" | "repeated";

/**
 * What a word does to a chain.
 *
 * @example
 * ```ts
 * import type { ShiritoriPlay } from "@johnmorrisdotca/kotoba";
 *
 * const play: ShiritoriPlay = { ok: true, loses: false, next: "ら" };
 * console.log(play);
 * ```
 */
export type ShiritoriPlay =
  | { readonly ok: true; readonly loses: false; readonly next: string }
  | { readonly ok: true; readonly loses: true; readonly next: null }
  | { readonly ok: false; readonly why: ShiritoriRefusal };

/**
 * Judges one word against the readings played so far.
 *
 * @param played - The readings so far, oldest first; empty for the first word.
 * @param reading - The reading of the word now said.
 * @param rules - House rules; the forgiving ones if left out.
 * @returns Whether the word stands, where it leaves the chain, or why it was refused.
 * @example
 * ```ts
 * import { playShiritori } from "@johnmorrisdotca/kotoba";
 *
 * console.log(playShiritori(["さくら"], "らくだ"), playShiritori(["さくら"], "いぬ"), playShiritori(["さくら"], "らいおん"));
 * ```
 */
export function playShiritori(played: readonly string[], reading: string, rules: ShiritoriRules = {}): ShiritoriPlay {
  const said = normalizeShiritoriReading(reading);
  if (shiritoriHeadKey(said, rules) === null) return { ok: false, why: "not-kana" };
  const last = played.at(-1);
  if (last !== undefined) {
    const key = shiritoriTailKey(last, rules);
    if (key === null || !shiritoriReadingContinues(said, key, rules)) return { ok: false, why: "wrong-start" };
    if (played.some((word) => normalizeShiritoriReading(word) === said)) return { ok: false, why: "repeated" };
  }
  const next = shiritoriTailKey(said, rules);
  return next === null ? { ok: true, loses: true, next: null } : { ok: true, loses: false, next };
}

/**
 * The words of a pool that could be played next and do not lose, in the pool's own order.
 *
 * @param pool - Any words with a `reading`; the list's are commonest first.
 * @param played - The readings so far, oldest first.
 * @param rules - House rules; the forgiving ones if left out.
 * @returns The playable words, which may be none: that is how a chain ends without a ん.
 * @example
 * ```ts
 * import { shiritoriChoices } from "@johnmorrisdotca/kotoba";
 *
 * console.log(shiritoriChoices([{ reading: "らくだ" }, { reading: "らいおん" }], ["さくら"]));
 * ```
 */
export function shiritoriChoices<Word extends { readonly reading: string }>(
  pool: readonly Word[],
  played: readonly string[],
  rules: ShiritoriRules = {},
): Word[] {
  return pool.filter((word) => {
    const play = playShiritori(played, word.reading, rules);
    return play.ok && !play.loses;
  });
}
