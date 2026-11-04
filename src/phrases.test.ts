import { describe, expect, it } from "vitest";
import { shiritoriChoices, shiritoriHeadKey, shiritoriTailKey } from "./kana/shiritori.ts";
import { JA_IDIOMS } from "./lists/idioms-ja.data.ts";
import { JA_PROVERBS } from "./lists/proverbs-ja.data.ts";
import { JA_SHIRITORI } from "./lists/shiritori-ja.data.ts";
import { JA_YOJIJUKUGO } from "./lists/yojijukugo-ja.data.ts";
import { readIdioms, readSayings, readShiritoriWords, searchIdioms, searchSayings } from "./phrases.ts";

const idioms = readIdioms(JA_IDIOMS);
const words = readShiritoriWords(JA_SHIRITORI);
const idiom = (written: string) => idioms.find((one) => one.idiom === written);

describe("the idioms", () => {
  it("are as many as JMdict marks, each with a reading and a meaning", () => {
    expect(idioms.filter((one) => one.kind === "idiom").length).toBeGreaterThan(1300);
    expect(idioms.filter((one) => one.kind === "expression").length).toBeGreaterThan(500);
    for (const one of idioms) {
      expect(one.idiom, one.idiom).not.toBe("");
      expect(one.reading, one.idiom).not.toBe("");
      expect(one.meaning, one.idiom).not.toBe("");
      expect(one.meanings[0], one.idiom).toBe(one.meaning);
    }
    expect(new Set(idioms.map((one) => one.idiom)).size).toBe(idioms.length);
  });

  it("say whose judgement put them there", () => {
    expect(idiom("油を売る")?.kind).toBe("idiom");
    for (const written of ["鼻が高い", "口が軽い", "目がない", "肩を持つ", "気が置けない", "腕を上げる"])
      expect(idiom(written)?.kind, written).toBe("expression");
  });

  it("take no phrase that means what it says", () => {
    expect(idiom("手を洗う")).toBeUndefined();
  });

  it("give the meaning of the sense that is the idiom, not of the literal one before it", () => {
    expect(idiom("胡坐をかく")?.meaning).toBe("to rest on one's laurels");
    expect(idiom("頭が痛い")?.meaning).toBe("racking one's brains");
    expect(idiom("足が早い")?.meaning).toContain("spoil");
  });

  it("keep the other glosses, since one alone can mislead", () => {
    expect(idiom("油を注ぐ")?.meanings).toContain("to add fuel (e.g. to a dispute)");
  });

  it("write a phrase in kanji where the dictionary can, and keep a phrase that has only kana", () => {
    expect(idiom("馬が合う")?.reading).toBe("うまがあう");
    expect(idiom("トップランナー")?.kanji).toEqual([]);
  });

  it("mark as elementary only what is written in kanji taught in elementary school", () => {
    expect(idiom("油を売る")?.elementary).toBe(true);
    expect(idiom("阿吽の呼吸")?.elementary).toBe(false);
    expect(idiom("トップランナー")?.elementary).toBe(true);
  });

  it("leave out what JMdict marks vulgar, sensitive or derogatory", () => {
    for (const written of ["尻の穴が小さい", "職場の花", "昼行灯", "脳内お花畑"])
      expect(idiom(written), written).toBeUndefined();
  });

  it("can be searched by what is written, read or meant, whatever the case", () => {
    const found = (text: string) => searchIdioms(idioms, text).map((one) => one.idiom);
    expect(found("油を売")).toContain("油を売る");
    expect(found("あぶらをう")).toContain("油を売る");
    expect(found("LOAF")).toContain("油を売る");
    expect(found("  ")).toHaveLength(idioms.length);
    expect(found("no such phrase anywhere")).toEqual([]);
  });
});

describe("the shiritori words", () => {
  it("are everyday nouns, one a reading, each with a word and a meaning", () => {
    expect(words.length).toBeGreaterThan(5000);
    expect(new Set(words.map((one) => one.reading)).size).toBe(words.length);
    for (const one of words) {
      expect(one.reading, one.word).toMatch(/^[ぁ-ゖァ-ヶー]{2,}$/u);
      expect(one.word, one.reading).not.toBe("");
      expect(one.meaning, one.reading).not.toBe("");
    }
  });

  it("hold the words a person would say", () => {
    const readings = new Set(words.map((one) => one.reading));
    for (const reading of ["さくら", "やま", "がっこう", "ねこ", "いぬ", "くるま"])
      expect(readings.has(reading), reading).toBe(true);
  });

  it("put the commonest first, and leave nobody stuck: every word's end is some word's start", () => {
    expect(words.slice(0, 200).map((one) => one.word)).toContain("相手");
    const heads = new Map<string, number>();
    for (const one of words) {
      const head = shiritoriHeadKey(one.reading) as string;
      heads.set(head, (heads.get(head) ?? 0) + 1);
    }
    for (const one of words) {
      const tail = shiritoriTailKey(one.reading);
      if (tail !== null) expect(heads.get(tail) ?? 0, one.reading).toBeGreaterThan(0);
    }
  });

  it("offer a chain a way on", () => {
    expect(shiritoriChoices(words, ["さくら"]).length).toBeGreaterThan(10);
    expect(shiritoriChoices(words, ["さくら"]).every((one) => shiritoriTailKey(one.reading) !== null)).toBe(true);
  });
});

describe("the proverbs and the four-character compounds", () => {
  const proverbs = readSayings(JA_PROVERBS);
  const yoji = readSayings(JA_YOJIJUKUGO);
  const of = (list: ReturnType<typeof readSayings>, written: string) => list.find((one) => one.saying === written);

  it("hold what JMdict marks as proverbs and as yojijukugo, less what it bars, one a written form", () => {
    expect(proverbs.length).toBeGreaterThan(900);
    expect(yoji.length).toBeGreaterThan(1800);
    for (const list of [proverbs, yoji]) {
      expect(new Set(list.map((one) => one.saying)).size).toBe(list.length);
      for (const one of list) {
        expect(one.reading, one.saying).toMatch(/^[ぁ-ゖァ-ヶー、・\s]+$/u);
        expect(one.meaning, one.saying).not.toBe("");
        expect(one.meanings[0], one.saying).toBe(one.meaning);
      }
    }
    expect(yoji.filter((one) => [...one.saying].length === 4).length).toBeGreaterThan(yoji.length * 0.99);
  });

  it("give the plain English of the sense that is the saying", () => {
    expect(of(proverbs, "猿も木から落ちる")?.reading).toBe("さるもきからおちる");
    expect(of(proverbs, "猿も木から落ちる")?.meanings.join(" ")).toContain("monkey");
    expect(of(yoji, "七転八起")?.reading).toBe("しちてんはっき");
    expect(of(yoji, "一石二鳥")?.meanings.join(" ")).toContain("two birds");
    expect(of(yoji, "一石二鳥")?.elementary).toBe(true);
    expect(of(yoji, "一石二鳥")?.kanji).toEqual(["一", "石", "二", "鳥"]);
  });

  it("leave out what JMdict marks vulgar, X-rated, sensitive or derogatory, and what names sex or the sex trade, because children play", () => {
    for (const written of [
      "盲蛇に怖じず",
      "群盲象を撫でる",
      "朝マラの立たぬ男に金貸すな",
      "一盗二婢三妾四妓五妻",
      "陰裏の豆もはじけ時",
    ])
      expect(of(proverbs, written), written).toBeUndefined();
    for (const written of ["三百代言", "無学文盲", "朝雲暮雨", "巫山雲雨", "精力絶倫"])
      expect(of(yoji, written), written).toBeUndefined();
    const adult =
      /\b(sex|sexual|sexually|erection|genital\w*|penis|vagina|prostitut\w*|whore|brothel|mistress|concubine|courtesan|adulter\w*|lustful|nipple)\b/i;
    for (const one of [...proverbs, ...yoji]) expect(adult.test(one.meanings.join(" ")), one.saying).toBe(false);
  });

  it("can be searched by what is written, read or meant, whatever the case", () => {
    const found = (list: ReturnType<typeof readSayings>, text: string) =>
      searchSayings(list, text).map((one) => one.saying);
    expect(found(proverbs, "猿も木")).toContain("猿も木から落ちる");
    expect(found(proverbs, "さるもきから")).toContain("猿も木から落ちる");
    expect(found(proverbs, "MONKEY")).toContain("猿も木から落ちる");
    expect(found(yoji, "two birds")).toContain("一石二鳥");
    expect(found(yoji, "  ")).toHaveLength(yoji.length);
    expect(found(yoji, "no such saying anywhere")).toEqual([]);
  });
});
