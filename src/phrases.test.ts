import { describe, expect, it } from "vitest";
import { shiritoriChoices, shiritoriHeadKey, shiritoriTailKey } from "./kana/shiritori.ts";
import { JA_IDIOMS } from "./lists/idioms-ja.data.ts";
import { JA_SHIRITORI } from "./lists/shiritori-ja.data.ts";
import { readIdioms, readShiritoriWords, searchIdioms } from "./phrases.ts";

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
