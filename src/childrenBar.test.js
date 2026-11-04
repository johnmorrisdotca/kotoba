import { describe, expect, it } from "vitest";
import { ADULT_GLOSS, barredWords, japaneseBar, lineBar, wordBar } from "../scripts/children-bar.mjs";
import { JA_IDIOMS } from "./lists/idioms-ja.data.ts";
import { JA_WORDS_3 } from "./lists/kana-3.data.ts";
import { JA_WORDS_4 } from "./lists/kana-4.data.ts";
import { JA_WORDS_5 } from "./lists/kana-5.data.ts";
import { EN_MEANINGS_4 } from "./lists/meanings-en-4.data.ts";
import { EN_MEANINGS_5 } from "./lists/meanings-en-5.data.ts";
import { EN_MEANINGS_6 } from "./lists/meanings-en-6.data.ts";
import { POP_ANSWERS } from "./lists/pop-answers.data.ts";
import { JA_PROVERBS } from "./lists/proverbs-ja.data.ts";
import { JA_SHIRITORI } from "./lists/shiritori-ja.data.ts";
import { DE_WORDS } from "./lists/words-de.data.ts";
import { EN_WORDS } from "./lists/words-en.data.ts";
import { FR_WORDS } from "./lists/words-fr.data.ts";
import { JA_YOJIJUKUGO } from "./lists/yojijukugo-ja.data.ts";
import { unpack } from "./lists.ts";
import { readIdioms, readSayings, readShiritoriWords } from "./phrases.ts";

/**
 * NOTHING IN A LIST IS FOR AN ADULT. Children play these games, and one rule keeps every list clean: scripts/children-bar.mjs,
 * which the scripts that write the lists (the monthly JMdict refresh among them) all call. The bar's cases are tried on
 * entries made for the purpose, then the known bad words are held out of every list the package ships.
 */

const entry = (...senses) => `<entry>${senses.map((sense) => `<sense>${sense}</sense>`).join("")}</entry>`;
const marked = (mark) => `<misc>&${mark};</misc><gloss>a</gloss>`;

describe("the bar on Japanese entries", () => {
  it("bars a sense JMdict marks vulgar, X-rated, sensitive or derogatory", () => {
    for (const mark of ["vulg", "X", "sens", "derog"]) expect(japaneseBar(entry(marked(mark)))).toBe("mark");
    expect(japaneseBar(entry(marked("col")))).toBeNull();
  });

  it("bars a gloss that names sex or the sex trade, which JMdict does not always mark", () => {
    for (const gloss of [
      "sexual liaison",
      "extramarital sex",
      "street prostitute",
      "to reach orgasm",
      "a (sexual) penetration",
      "brothel",
      "mistress; concubine",
    ])
      expect(japaneseBar(entry(`<gloss>${gloss}</gloss>`)), gloss).toBe("gloss");
  });

  it("lets through the words that only look like it", () => {
    for (const gloss of [
      "rapeseed oil",
      "sperm whales",
      "social intercourse",
      "mistress (of a house)",
      "mistress of the house",
      "Essex",
      "insertion",
    ])
      expect(japaneseBar(entry(`<gloss>${gloss}</gloss>`)), gloss).toBeNull();
  });

  it("looks at every sense, or only the first", () => {
    const later = entry("<gloss>a dog</gloss>", marked("vulg"));
    expect(japaneseBar(later)).toBe("mark");
    expect(japaneseBar(later, "all")).toBe("mark");
    expect(japaneseBar(later, "first")).toBeNull();
    expect(japaneseBar(entry("<gloss>a dog</gloss>", "<gloss>prostitute</gloss>"), "first")).toBeNull();
    expect(japaneseBar(entry("<gloss>a dog</gloss>", "<gloss>prostitute</gloss>"))).toBe("gloss");
  });

  it("reads a gloss with a type, as JMdict writes one", () => {
    expect(japaneseBar(entry('<gloss g_type="lit">to open one&apos;s thighs</gloss><gloss>to have sex</gloss>'))).toBe(
      "gloss",
    );
  });
});

describe("the bar on English lines and words", () => {
  it("bars a line that says vulgar, sexual, violent, drink or drugs, and a word that is one", () => {
    for (const text of [
      "a vulgar word",
      "an alcoholic beverage made from grain",
      "beer",
      "wine",
      "a firearm that is held and fired with one hand",
      "to kill",
      "a narcotic drug",
      "a stupid person",
      "gore",
    ])
      expect(lineBar(text), text).toBe(true);
  });

  it("lets an everyday line through", () => {
    for (const text of [
      "a domesticated carnivorous mammal",
      "the fluid that is pumped through the body",
      "a sword-shaped leaf",
      "an udder",
      "rapeseed",
    ])
      expect(lineBar(text), text).toBe(false);
  });

  it("names the words never hidden, in each language", () => {
    for (const word of ["fuck", "beer", "kill", "vodka", "murder"]) expect(wordBar(word, "en"), word).toBe(true);
    for (const word of ["merde", "biere", "tuer", "rhum"]) expect(wordBar(word, "fr"), word).toBe(true);
    for (const word of ["fotze", "bier", "mord", "droge"]) expect(wordBar(word, "de"), word).toBe(true);
    expect(wordBar("table", "en")).toBe(false);
    expect(barredWords("en").size).toBeGreaterThan(200);
  });
});

describe("no Japanese list holds an adult word", () => {
  const idioms = readIdioms(JA_IDIOMS);
  const shiritori = readShiritoriWords(JA_SHIRITORI);
  const proverbs = readSayings(JA_PROVERBS);
  const compounds = readSayings(JA_YOJIJUKUGO);

  it("keeps the idioms JMdict does not mark out, and the shiritori words with them", () => {
    const written = new Set(idioms.map((one) => one.idiom));
    for (const idiom of [
      "股を開く",
      "闇の女",
      "籠の鳥",
      "お茶を挽く",
      "気をやる",
      "鼻の下を伸ばす",
      "身を沈める",
      "手が付く",
    ])
      expect(written.has(idiom), idiom).toBe(false);
    const words = new Set(shiritori.map((one) => one.word));
    for (const word of ["セックス", "売春", "浮気", "異性", "性別", "挿入"]) expect(words.has(word), word).toBe(false);
  });

  it("keeps the proverbs and the compounds out too", () => {
    const written = new Set([...proverbs, ...compounds].map((one) => one.saying));
    for (const saying of ["朝雲暮雨", "巫山雲雨", "精力絶倫", "猫にまたたびお女郎に小判", "一盗二婢三妾四妓五妻"])
      expect(written.has(saying), saying).toBe(false);
  });

  it("shows no meaning that names sex or the sex trade", () => {
    for (const list of [idioms, proverbs, compounds])
      for (const one of list)
        for (const meaning of one.meanings)
          expect(ADULT_GLOSS.test(meaning), `${one.idiom ?? one.saying}: ${meaning}`).toBe(false);
    for (const one of shiritori) expect(ADULT_GLOSS.test(one.meaning), `${one.word}: ${one.meaning}`).toBe(false);
  });

  it("keeps the words out of the kana lists, answers and guesses alike", () => {
    const every = new Set(
      [unpack(JA_WORDS_3, 3), unpack(JA_WORDS_4, 4), unpack(JA_WORDS_5, 5)].flatMap((list) => [
        ...list.allowed,
        ...list.answers,
        ...list.easy,
      ]),
    );
    for (const word of [
      "せっくす",
      "ばいしゅん",
      "いんらん",
      "えろい",
      "ちんぽ",
      "ぽるの",
      "おなに",
      "ふりん",
      "ぼっき",
      "れいぷ",
      "ふぇらちお",
      "すけべ",
    ])
      expect(every.has(word), word).toBe(false);
  });

  it("keeps the everyday words that only share a letter with them", () => {
    const answers = new Set(unpack(JA_WORDS_3, 3).answers);
    for (const word of ["おんな", "だんな", "むすこ", "できる"]) expect(answers.has(word), word).toBe(true);
  });
});

describe("no alphabet list hides a word that is not for children", () => {
  const words = (text) => text.split(/\s+/).filter(Boolean);
  const hidden = (lists) => Object.values(lists).flatMap((one) => [...words(one.easy), ...words(one.answers)]);

  it.each([
    ["en", EN_WORDS],
    ["fr", FR_WORDS],
    ["de", DE_WORDS],
  ])("hides none of the words barred in %s, though they may be guessed", (language, lists) => {
    const barred = barredWords(language);
    expect(hidden(lists).filter((word) => barred.has(word))).toEqual([]);
    expect(Object.values(lists).some((one) => words(one.allowed).some((word) => barred.has(word)))).toBe(true);
  });

  it("hides none of the known bad English words, drink and violence among them", () => {
    const answers = new Set(hidden(EN_WORDS));
    for (const word of [
      "beer",
      "wine",
      "vodka",
      "drunk",
      "kill",
      "murder",
      "stab",
      "gore",
      "rifle",
      "pistol",
      "weapon",
      "bomb",
      "naked",
      "slave",
      "bloody",
      "corpse",
      "opium",
    ])
      expect(answers.has(word), word).toBe(false);
  });

  it("has no bad word among the pop-culture answers", () => {
    const barred = barredWords("en");
    for (const list of Object.values(POP_ANSWERS))
      for (const word of words(list)) expect(barred.has(word.replace(/\.\d+$/, "")), word).toBe(false);
  });
});

describe("no English meaning is for adults", () => {
  const rows = [EN_MEANINGS_4, EN_MEANINGS_5, EN_MEANINGS_6].flatMap((one) =>
    one.rows.split("\n").map((row) => row.split("\t")),
  );

  it("shows no line the bar names, and none for a word it names", () => {
    expect(rows.length).toBeGreaterThan(15000);
    for (const [word, line] of rows) expect(lineBar(`${word} ${line}`), `${word}: ${line}`).toBe(false);
  });

  it("has no meaning for the known bad words", () => {
    const shown = new Set(rows.map(([word]) => word));
    for (const word of [
      "beer",
      "beers",
      "wine",
      "vodka",
      "booze",
      "kill",
      "murder",
      "pistol",
      "rifle",
      "gore",
      "cigar",
      "opium",
      "slut",
      "whore",
      "porn",
      "penis",
    ])
      expect(shown.has(word), word).toBe(false);
  });
});
