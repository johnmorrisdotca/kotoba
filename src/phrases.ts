/**
 * Reading the Japanese idiom, shiritori, proverb and four-character compound lists once they are loaded. Each list is
 * an entry point of its own (`/idioms-ja`, `/shiritori-ja`, `/proverbs-ja`, `/yojijukugo-ja`), so a page fetches only
 * what it uses.
 */

/**
 * Whose judgement put a phrase on the list: `"idiom"` is JMdict's own, an entry it marks idiomatic; `"expression"` is
 * this package's rule, for set phrases JMdict files as plain expressions (鼻が高い, "proud").
 *
 * @example
 * ```ts
 * import type { IdiomKind } from "@johnmorrisdotca/kotoba";
 *
 * const kind: IdiomKind = "idiom";
 * console.log(kind);
 * ```
 */
export type IdiomKind = "idiom" | "expression";

/**
 * One set phrase.
 *
 * @example
 * ```ts
 * import type { Idiom } from "@johnmorrisdotca/kotoba";
 *
 * const one: Idiom = { idiom: "油を売る", reading: "あぶらをうる", meaning: "to loaf", meanings: ["to loaf"], kind: "idiom", kanji: ["油", "売"], elementary: true, common: false };
 * console.log(one.idiom);
 * ```
 */
export type Idiom = {
  /** How it is written. */
  readonly idiom: string;
  /** How it is read. */
  readonly reading: string;
  /** Its first plain English gloss, from the sense that makes it an idiom. */
  readonly meaning: string;
  /** Every plain English gloss of that sense, `meaning` first. */
  readonly meanings: readonly string[];
  /** Whose judgement put it on the list. */
  readonly kind: IdiomKind;
  /** The kanji it is written with, once each, in the order they appear. */
  readonly kanji: readonly string[];
  /** Every kanji in it is taught in Japanese elementary school, or it has none. */
  readonly elementary: boolean;
  /** JMdict marks it as common. */
  readonly common: boolean;
};

/**
 * The idiom list as it is stored: one row a phrase, the three flags as 0 or 1.
 *
 * @example
 * ```ts
 * import type { PackedIdioms } from "@johnmorrisdotca/kotoba";
 *
 * const packed: PackedIdioms = { release: "2026-10-31", idioms: [["油を売る", "あぶらをうる", ["to loaf"], 1, 1, 0]] };
 * console.log(packed.release);
 * ```
 */
export type PackedIdioms = {
  /** The JMdict release it was made from. */
  readonly release: string;
  /** Written form, reading, meanings, then is-JMdict's-idiom, elementary and common. */
  readonly idioms: readonly (readonly [string, string, readonly string[], number, number, number])[];
};

/**
 * Reads the stored idiom list into plain rows.
 *
 * @param packed - `JA_IDIOMS`, from `@johnmorrisdotca/kotoba/idioms-ja`.
 * @returns Every phrase, in the order of its reading.
 * @example
 * ```ts
 * import { readIdioms } from "@johnmorrisdotca/kotoba";
 * import { JA_IDIOMS } from "@johnmorrisdotca/kotoba/idioms-ja";
 *
 * console.log(readIdioms(JA_IDIOMS).length);
 * ```
 */
export function readIdioms(packed: PackedIdioms): Idiom[] {
  return packed.idioms.map(([idiom, reading, meanings, marked, elementary, common]) => ({
    idiom,
    reading,
    meaning: meanings[0] ?? "",
    meanings,
    kind: marked === 1 ? "idiom" : "expression",
    kanji: [...new Set([...idiom].filter((character) => /\p{Script=Han}/u.test(character)))],
    elementary: elementary === 1,
    common: common === 1,
  }));
}

/**
 * The phrases that hold a piece of text in their written form, their reading or any of their meanings, ignoring case.
 *
 * @param idioms - The phrases to search, from `readIdioms`.
 * @param text - What was typed; blank text matches every phrase.
 * @returns The phrases that match, in the order given.
 * @example
 * ```ts
 * import { readIdioms, searchIdioms } from "@johnmorrisdotca/kotoba";
 * import { JA_IDIOMS } from "@johnmorrisdotca/kotoba/idioms-ja";
 *
 * console.log(searchIdioms(readIdioms(JA_IDIOMS), "油").length);
 * ```
 */
export function searchIdioms(idioms: readonly Idiom[], text: string): Idiom[] {
  const needle = text.trim().toLowerCase();
  if (needle === "") return [...idioms];
  return idioms.filter((one) =>
    `${one.idiom}\n${one.reading}\n${one.meanings.join("\n").toLowerCase()}`.includes(needle),
  );
}

/**
 * One proverb or four-character compound.
 *
 * @example
 * ```ts
 * import type { Saying } from "@johnmorrisdotca/kotoba";
 *
 * const one: Saying = { saying: "七転八起", reading: "しちてんはっき", meaning: "falling seven times, getting up eight", meanings: ["falling seven times, getting up eight"], kanji: ["七", "転", "八", "起"], elementary: true, common: false };
 * console.log(one.saying);
 * ```
 */
export type Saying = {
  /** How it is written. */
  readonly saying: string;
  /** How it is read. */
  readonly reading: string;
  /** Its first plain English gloss, from the sense JMdict marks as a proverb or a four-character compound. */
  readonly meaning: string;
  /** Every plain English gloss of that sense, `meaning` first. */
  readonly meanings: readonly string[];
  /** The kanji it is written with, once each, in the order they appear. */
  readonly kanji: readonly string[];
  /** Every kanji in it is taught in Japanese elementary school, or it has none. */
  readonly elementary: boolean;
  /** JMdict marks it as common. */
  readonly common: boolean;
};

/**
 * The proverb and four-character compound lists as they are stored: one row an entry, the two flags as 0 or 1.
 *
 * @example
 * ```ts
 * import type { PackedSayings } from "@johnmorrisdotca/kotoba";
 *
 * const packed: PackedSayings = { release: "2026-11-04", sayings: [["七転八起", "しちてんはっき", ["falling seven times, getting up eight"], 1, 0]] };
 * console.log(packed.release);
 * ```
 */
export type PackedSayings = {
  /** The JMdict release it was made from. */
  readonly release: string;
  /** Written form, reading, meanings, then elementary and common. */
  readonly sayings: readonly (readonly [string, string, readonly string[], number, number])[];
};

/**
 * Reads a stored list of proverbs or four-character compounds into plain rows.
 *
 * @param packed - `JA_PROVERBS`, from `@johnmorrisdotca/kotoba/proverbs-ja`, or `JA_YOJIJUKUGO`, from `@johnmorrisdotca/kotoba/yojijukugo-ja`.
 * @returns Every entry, in the order of its reading.
 * @example
 * ```ts
 * import { readSayings } from "@johnmorrisdotca/kotoba";
 * import { JA_PROVERBS } from "@johnmorrisdotca/kotoba/proverbs-ja";
 *
 * console.log(readSayings(JA_PROVERBS).length);
 * ```
 */
export function readSayings(packed: PackedSayings): Saying[] {
  return packed.sayings.map(([saying, reading, meanings, elementary, common]) => ({
    saying,
    reading,
    meaning: meanings[0] ?? "",
    meanings,
    kanji: [...new Set([...saying].filter((character) => /\p{Script=Han}/u.test(character)))],
    elementary: elementary === 1,
    common: common === 1,
  }));
}

/**
 * The proverbs or compounds that hold a piece of text in their written form, their reading or any of their meanings, ignoring case.
 *
 * @param sayings - The entries to search, from `readSayings`.
 * @param text - What was typed; blank text matches every entry.
 * @returns The entries that match, in the order given.
 * @example
 * ```ts
 * import { readSayings, searchSayings } from "@johnmorrisdotca/kotoba";
 * import { JA_YOJIJUKUGO } from "@johnmorrisdotca/kotoba/yojijukugo-ja";
 *
 * console.log(searchSayings(readSayings(JA_YOJIJUKUGO), "two birds")[0]?.saying);
 * ```
 */
export function searchSayings(sayings: readonly Saying[], text: string): Saying[] {
  const needle = text.trim().toLowerCase();
  if (needle === "") return [...sayings];
  return sayings.filter((one) =>
    `${one.saying}\n${one.reading}\n${one.meanings.join("\n").toLowerCase()}`.includes(needle),
  );
}

/**
 * One word of the shiritori list.
 *
 * @example
 * ```ts
 * import type { ShiritoriWord } from "@johnmorrisdotca/kotoba";
 *
 * const one: ShiritoriWord = { reading: "さくら", word: "桜", meaning: "cherry tree" };
 * console.log(one.word);
 * ```
 */
export type ShiritoriWord = {
  /** How it is read: what a chain is judged on. */
  readonly reading: string;
  /** How it is written. */
  readonly word: string;
  /** Its first plain English gloss. */
  readonly meaning: string;
};

/**
 * Reads the stored shiritori list into plain rows, commonest first.
 *
 * @param packed - `JA_SHIRITORI`, from `@johnmorrisdotca/kotoba/shiritori-ja`: its `rows` hold one word a line, reading, word and meaning separated by tabs.
 * @returns Every word, commonest first.
 * @example
 * ```ts
 * import { readShiritoriWords, shiritoriChoices } from "@johnmorrisdotca/kotoba";
 * import { JA_SHIRITORI } from "@johnmorrisdotca/kotoba/shiritori-ja";
 *
 * console.log(shiritoriChoices(readShiritoriWords(JA_SHIRITORI), ["さくら"])[0]);
 * ```
 */
export function readShiritoriWords(packed: { readonly release: string; readonly rows: string }): ShiritoriWord[] {
  return packed.rows.split("\n").map((row) => {
    const [reading, word, meaning] = row.split("\t") as [string, string, string];
    return { reading, word, meaning };
  });
}
