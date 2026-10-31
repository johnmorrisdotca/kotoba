import { describe, expect, it } from "vitest";
import {
  normalizeShiritoriReading,
  playShiritori,
  shiritoriChoices,
  shiritoriDistractorScore,
  shiritoriHeadKey,
  shiritoriReadingContinues,
  shiritoriReadingIsPlayable,
  shiritoriTailKey,
} from "./shiritori.ts";

describe("what a word starts and ends on", () => {
  it("folds katakana into hiragana and drops what is not kana", () => {
    expect(normalizeShiritoriReading(" コーヒー ")).toBe("こーひー");
    expect(normalizeShiritoriReading("ab・さくら1")).toBe("さくら");
  });

  it("ends on its last kana, read large and without its voicing", () => {
    expect(shiritoriTailKey("さくら")).toBe("ら");
    expect(shiritoriTailKey("かぜ")).toBe("せ");
    expect(shiritoriTailKey("きしゃ")).toBe("や");
    expect(shiritoriTailKey("ぱ")).toBe("は");
  });

  it("chains a final ー on the vowel it lengthens", () => {
    expect(shiritoriTailKey("コーヒー")).toBe("い");
    expect(shiritoriTailKey("カー")).toBe("あ");
    expect(shiritoriTailKey("ガー")).toBe("あ");
  });

  it("says plainly that a word ending in ん, or holding no kana, leads nowhere", () => {
    expect(shiritoriTailKey("みかん")).toBeNull();
    expect(shiritoriTailKey("ー")).toBeNull();
    expect(shiritoriTailKey("")).toBeNull();
    expect(shiritoriHeadKey("")).toBeNull();
  });

  it("starts on its first kana, read the same way", () => {
    expect(shiritoriHeadKey("がっこう")).toBe("か");
    expect(shiritoriHeadKey("パン")).toBe("は");
  });
});

describe("the house rules", () => {
  it("keeps the voicing when told to, at both ends", () => {
    const kept = { voicing: "kept" } as const;
    expect(shiritoriHeadKey("がっこう", kept)).toBe("が");
    expect(shiritoriTailKey("かぜ", kept)).toBe("ぜ");
    expect(shiritoriReadingContinues("せみ", "ぜ", kept)).toBe(false);
    expect(shiritoriReadingContinues("せみ", "せ")).toBe(true);
  });

  it("chains a final ー on the kana before it when told to", () => {
    expect(shiritoriTailKey("コーヒー", { longVowel: "before" })).toBe("ひ");
    expect(shiritoriTailKey("ガー", { longVowel: "before", voicing: "kept" })).toBe("が");
    expect(shiritoriTailKey("ガー", { voicing: "kept" })).toBe("あ");
  });
});

describe("whether a word may be played", () => {
  it("wants the right start, and for a playable word an end that does not lose", () => {
    expect(shiritoriReadingContinues("らいおん", "ら")).toBe(true);
    expect(shiritoriReadingIsPlayable("らいおん", "ら")).toBe(false);
    expect(shiritoriReadingIsPlayable("らくだ", "ら")).toBe(true);
    expect(shiritoriReadingIsPlayable("いぬ", "ら")).toBe(false);
  });

  it("judges a word against the chain: on, lost, or refused with the reason", () => {
    expect(playShiritori([], "さくら")).toEqual({ ok: true, loses: false, next: "ら" });
    expect(playShiritori(["さくら"], "らくだ")).toEqual({ ok: true, loses: false, next: "た" });
    expect(playShiritori(["さくら"], "らいおん")).toEqual({ ok: true, loses: true, next: null });
    expect(playShiritori(["さくら"], "いぬ")).toEqual({ ok: false, why: "wrong-start" });
    expect(playShiritori(["さくら"], "123")).toEqual({ ok: false, why: "not-kana" });
    expect(playShiritori(["さくら", "らくだ", "だいこ", "こら"], "ラクダ")).toEqual({ ok: false, why: "repeated" });
  });

  it("refuses to go on from a word that already ended the chain", () => {
    expect(playShiritori(["みかん"], "あめ")).toEqual({ ok: false, why: "wrong-start" });
  });

  it("offers what can be played next, in the pool's own order, never a word that loses or one already said", () => {
    const pool = [
      { reading: "らいおん" },
      { reading: "らくだ" },
      { reading: "らっぱ" },
      { reading: "いぬ" },
      { reading: "さくら" },
    ];
    expect(shiritoriChoices(pool, ["さくら"]).map((word) => word.reading)).toEqual(["らくだ", "らっぱ"]);
    expect(shiritoriChoices(pool, ["らくだ", "だら"]).map((word) => word.reading)).toEqual(["らっぱ"]);
    expect(shiritoriChoices([{ reading: "いぬ" }], ["さくら"])).toEqual([]);
  });
});

describe("a tempting wrong answer", () => {
  it("scores nothing for a right answer or no answer, and more for a shared vowel or a matching end", () => {
    expect(shiritoriDistractorScore("さる", "さ")).toBe(0);
    expect(shiritoriDistractorScore("", "さ")).toBe(0);
    expect(shiritoriDistractorScore("きのこ", "さ")).toBe(1);
    expect(shiritoriDistractorScore("かわ", "さ")).toBe(4);
    expect(shiritoriDistractorScore("こさ", "さ")).toBe(3);
    expect(shiritoriDistractorScore("かさ", "さ")).toBe(6);
  });
});
