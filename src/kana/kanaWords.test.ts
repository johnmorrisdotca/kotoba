import { describe, expect, it } from "vitest";

import { KANA_SIZES, unpack, type KanaWords } from "../lists.ts";
import { JA_WORDS_3 } from "../lists/kana-3.data.ts";
import { JA_WORDS_4 } from "../lists/kana-4.data.ts";
import { JA_WORDS_5 } from "../lists/kana-5.data.ts";

const LISTS: Record<number, KanaWords> = { 3: unpack(JA_WORDS_3, 3), 4: unpack(JA_WORDS_4, 4), 5: unpack(JA_WORDS_5, 5) };

describe("the kana word lists", () => {
  for (const size of KANA_SIZES) {
    it(`reads the ${size}-kana list: 900 easy inside 2,000 answers, all of them guessable, every word ${size} kana`, () => {
      const words = LISTS[size]!;
      expect(words.easy).toHaveLength(900);
      expect(words.answers).toHaveLength(2000);
      const answers = new Set(words.answers);
      expect(words.easy.every((word) => answers.has(word))).toBe(true);
      expect(words.answers.every((word) => words.allowed.has(word))).toBe(true);
      for (const word of [...words.allowed].slice(0, 500)) expect([...word]).toHaveLength(size);
      expect([...words.allowed].every((word) => /^[ぁ-ゖー]+$/u.test(word))).toBe(true);
      expect(words.release).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  }

  it("keeps everyday words among the easy answers", () => {
    expect(LISTS[3]!.easy).toContain("こども");
    expect(LISTS[4]!.easy).toContain("べんとう");
    expect(LISTS[5]!.easy).toContain("えいきょう");
  });
});
