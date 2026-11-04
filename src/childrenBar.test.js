import { describe, expect, it } from "vitest";
import { adultGloss, barredWords, japaneseBar, lineBar, VULGAR_READINGS, wordBar } from "../scripts/children-bar.mjs";
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
      "brothel",
      "sex doll",
      "erection (of the penis)",
      "to have sex",
      "sexual desire",
      "sexual petting",
      "sex position",
      "female adulterer",
    ])
      expect(japaneseBar(entry(`<gloss>${gloss}</gloss>`)), gloss).toBe("gloss");
    expect(japaneseBar(entry("<gloss>mistress</gloss><gloss>kept woman</gloss>"))).toBe("gloss");
    expect(japaneseBar(entry("<gloss>concubine (of a noble)</gloss>"))).toBe("gloss");
    expect(japaneseBar(entry("<gloss>nipple</gloss><gloss>teat</gloss>"))).toBe("gloss");
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
      "rape blossoms",
      "erection of a monument",
      "adulteration",
      "same sex",
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

/**
 * ORDINARY GOOD WORDS ARE NEVER FILTERED OUT (John, 2026-11-04). Each row is a word and its first sense as JMdict writes it
 * (read from the 2026-11-04 release): sex as gender or as the other sex, school, a building going up, a thing adulterated, a
 * plant, the body, birth, love, death, war and crime. The bar names a sex act, a sex organ or the sex trade, and JMdict's own marks.
 */
const ORDINARY = {
  性別: ["(distinction of) sex", "gender"],
  異性: ["the opposite sex"],
  同性: ["same sex"],
  共学: ["coeducation", "mixed-sex education"],
  性教育: ["sex education"],
  性的: ["sexual (i.e. relating to biological sex)"],
  男女: ["men and women", "man and woman", "both sexes", "both genders"],
  男女比: ["sex ratio", "gender ratio"],
  性染色体: ["sex chromosome"],
  性転換: ["sex change", "gender reassignment"],
  雌雄淘汰: ["sexual selection"],
  有性生殖: ["sexual reproduction", "syngamy"],
  性差別: ["sexual discrimination", "sex discrimination", "sexism"],
  建立: ["(act of) building (temple, monument, etc.)", "erection"],
  組み立て: ["construction", "framework", "erection", "assembly", "organization"],
  造営: ["building (a temple, palace, etc.)", "construction", "erection"],
  建て替え: ["rebuilding", "reconstruction", "re-erection"],
  混ぜ物: ["mixture", "adulteration"],
  混入: ["mixing", "blending", "adding", "adulteration", "contamination"],
  不純: ["impure", "adulterated", "foul", "mixed", "dishonest"],
  挿入: ["insertion", "interposition", "interpolation", "infixing", "(sexual) penetration"],
  菜の花: ["rape blossoms", "rapeseed flowers"],
  水油: ["hair oil", "camellia oil", "rape oil"],
  愛人: ["lover", "mistress"],
  女将: ["proprietress (of a traditional Japanese inn, restaurant, or shop)", "landlady", "hostess", "mistress"],
  正室: ["legal wife (of a noble) (as opposed to a concubine)"],
  男性: ["man", "male"],
  女性: ["woman", "female"],
  男子: ["boy"],
  女子: ["woman", "girl"],
  少女: ["girl (usu. between 7 and 17)", "young lady"],
  性格: ["character (of a person)", "personality", "disposition", "nature"],
  性質: ["nature (of a person)", "disposition", "temperament", "character"],
  性能: ["ability", "performance", "efficiency"],
  体: ["body"],
  胸: ["chest", "breast"],
  乳: ["milk"],
  母乳: ["mother's milk"],
  尿: ["urine"],
  血: ["blood"],
  裸: ["nakedness", "nudity"],
  結婚: ["marriage"],
  夫婦: ["married couple", "husband and wife", "man and wife"],
  恋人: ["lover", "sweetheart", "boyfriend", "girlfriend"],
  恋: ["(romantic) love"],
  彼氏: ["boyfriend"],
  キス: ["kiss"],
  抱く: ["to hold in one's arms (e.g. a baby)", "to embrace", "to hug"],
  妊娠: ["pregnancy", "conception", "gestation"],
  出産: ["childbirth", "(giving) birth", "delivery", "parturition"],
  赤ちゃん: ["baby", "infant"],
  誕生: ["birth (of a person)", "nativity"],
  下着: ["underwear", "undergarment", "underclothes", "lingerie"],
  風呂: ["bath", "bathing", "bathtub", "bathroom"],
  便所: ["toilet", "lavatory", "water closet", "restroom", "bathroom"],
  病気: ["illness", "disease", "sickness"],
  手術: ["surgery", "operation", "procedure"],
  死: ["death"],
  戦争: ["war"],
  戦い: ["battle", "war", "fight", "conflict"],
  暴力: ["violence", "mayhem"],
  虐待: ["abuse", "ill-treatment", "maltreatment", "mistreatment", "cruelty"],
  犯罪: ["crime", "offence", "offense"],
  銃: ["gun", "firearm", "small arms (e.g. rifle, pistol, etc)"],
  爆弾: ["bomb"],
  酒: ["alcohol", "sake"],
  ビール: ["beer"],
  麻薬: ["narcotic", "drug", "dope"],
  歴史: ["history"],
};

describe("ordinary good words are never barred", () => {
  it.each(Object.entries(ORDINARY))("lets %s through", (_, glosses) => {
    expect(japaneseBar(entry(glosses.map((one) => `<gloss>${one}</gloss>`).join(""))), glosses.join("; ")).toBeNull();
  });

  it("has at least thirty of them", () => {
    expect(Object.keys(ORDINARY).length).toBeGreaterThanOrEqual(30);
  });

  it("does not bar a word for a sex word further down than its first sense", () => {
    expect(japaneseBar(entry("<gloss>a dog</gloss>", "<gloss>pimp</gloss>"), "first")).toBeNull();
  });
});

describe("bad words stay out", () => {
  const BAD = {
    セックス: ["sex", "sexual intercourse"],
    売春: ["prostitution"],
    売春婦: ["prostitute"],
    強姦: ["rape", "sexual assault"],
    性器: ["genitals"],
    性交: ["sexual intercourse", "sex", "coitus"],
    精液: ["semen", "seminal fluid"],
    射精: ["ejaculation"],
    勃起: ["erection (of the penis)", "becoming erect"],
    ちんちん: ["penis"],
    乳首: ["nipple", "teat"],
    妾: ["mistress", "kept woman", "concubine"],
    不倫: ["adultery", "impropriety", "(an) affair"],
    朝雲暮雨: ["sexual liaison"],
    ラブホテル: ["love hotel", "short-stay hotel used primarily for sexual activity"],
    ダッチワイフ: ["sex doll"],
    セックスレス: ["sexless", "without sex"],
    性犯罪者: ["sex offender"],
    ペッティング: ["heavy petting", "sexual petting"],
    正常位: ["missionary (sex) position"],
    フェラチオ: ["fellatio", "blow job"],
    自慰: ["masturbation"],
    近親相姦: ["incest"],
    ポルノ: ["pornography"],
    遊女: ["prostitute", "harlot"],
  };

  it.each(Object.entries(BAD))("bars %s", (_, glosses) => {
    expect(japaneseBar(entry(glosses.map((one) => `<gloss>${one}</gloss>`).join(""))), glosses.join("; ")).toBe(
      "gloss",
    );
  });

  it("bars what JMdict itself marks", () => {
    for (const mark of ["vulg", "X", "sens", "derog"]) expect(japaneseBar(entry(marked(mark)))).toBe("mark");
  });

  it("names the readings that are obscene in themselves, whatever else is spelt the same", () => {
    for (const reading of ["まんこ", "うんこ", "おっぱい", "れいぷ", "ちんぽ"])
      expect(VULGAR_READINGS.has(reading), reading).toBe(true);
    for (const reading of ["ばんこ", "せいべつ", "おんな"]) expect(VULGAR_READINGS.has(reading), reading).toBe(false);
  });
});

describe("the bar on English lines and words", () => {
  it("bars a line that says vulgar, sexual, a sex organ, a slur, drugs or strong drink, and a word that is one", () => {
    for (const text of [
      "a vulgar word",
      "an offensive term",
      "sexual intercourse",
      "a male sex organ: penis",
      "a narcotic drug",
      "a strong liquor",
      "to commit suicide",
      "a stupid idiot",
    ])
      expect(lineBar(text), text).toBe(true);
  });

  it("lets an everyday line through, violence and the body and drink among them", () => {
    for (const text of [
      "a domesticated carnivorous mammal",
      "the fluid that is pumped through the body",
      "a sword-shaped leaf",
      "an udder",
      "rapeseed",
      "beer",
      "wine",
      "to kill",
      "blood",
      "naked",
      "urine",
      "a firearm that is held and fired with one hand",
      "an explosive bomb",
      "ugly",
      "a dumb answer",
    ])
      expect(lineBar(text), text).toBe(false);
  });

  it("names the words never hidden, in each language", () => {
    for (const word of ["fuck", "vodka", "penis", "slut", "heroin", "queer"])
      expect(wordBar(word, "en"), word).toBe(true);
    for (const word of ["merde", "ivre", "putain"]) expect(wordBar(word, "fr"), word).toBe(true);
    for (const word of ["fotze", "droge", "ficken"]) expect(wordBar(word, "de"), word).toBe(true);
    expect(wordBar("table", "en")).toBe(false);
    expect(barredWords("en").size).toBeGreaterThan(100);
  });

  it("does not name the plain words a child learns early", () => {
    for (const word of [
      "blood",
      "ugly",
      "dumb",
      "naked",
      "urine",
      "kill",
      "beer",
      "wine",
      "murder",
      "bomb",
      "weapon",
      "stupid",
      "drunk",
      "nude",
      "gore",
      "slave",
      "butt",
      "breast",
      "poop",
      "vomit",
    ])
      expect(wordBar(word, "en"), word).toBe(false);
    for (const word of ["sang", "tuer", "bombe", "biere"]) expect(wordBar(word, "fr"), word).toBe(false);
    for (const word of ["blut", "mord", "bier", "nackt", "waffe"]) expect(wordBar(word, "de"), word).toBe(false);
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
    for (const word of ["セックス", "売春", "浮気"]) expect(words.has(word), word).toBe(false);
  });

  it("keeps the ordinary words that only mention sex, a building or a mixture", () => {
    const words = new Set(shiritori.map((one) => one.word));
    for (const word of ["異性", "性別", "挿入", "男性", "女性", "性格"]) expect(words.has(word), word).toBe(true);
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
          expect(adultGloss(meaning), `${one.idiom ?? one.saying}: ${meaning}`).toBe(false);
    for (const one of shiritori) expect(adultGloss(one.meaning), `${one.word}: ${one.meaning}`).toBe(false);
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
      "まんこ",
      "うんこ",
      "おっぱい",
      "ちんこ",
    ])
      expect(every.has(word), word).toBe(false);
  });

  it("keeps the ordinary words that mention sex, a building or a mixture", () => {
    const every = new Set(
      [unpack(JA_WORDS_3, 3), unpack(JA_WORDS_4, 4), unpack(JA_WORDS_5, 5)].flatMap((list) => [...list.allowed]),
    );
    for (const word of [
      "せいべつ",
      "いせい",
      "どうせい",
      "きょうがく",
      "まぜもの",
      "こんりゅう",
      "そうにゅう",
      "ふじゅん",
      "あいじん",
      "ばんこ",
    ])
      expect(every.has(word), word).toBe(true);
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

  it("hides none of the known bad English words, and hides the plain ones", () => {
    const answers = new Set(hidden(EN_WORDS));
    for (const word of [
      "vodka",
      "heroin",
      "opium",
      "weed",
      "booze",
      "liquor",
      "queer",
      "retard",
      "moron",
      "pimp",
      "porn",
      "penis",
      "slut",
    ])
      expect(answers.has(word), word).toBe(false);
    for (const word of [
      "blood",
      "ugly",
      "dumb",
      "naked",
      "urine",
      "kill",
      "beer",
      "wine",
      "murder",
      "bomb",
      "weapon",
      "stupid",
      "gore",
      "slave",
    ])
      expect(answers.has(word), word).toBe(true);
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

  it("has no meaning for the known bad words, and has one for the plain ones", () => {
    const shown = new Set(rows.map(([word]) => word));
    for (const word of ["opium", "slut", "whore", "porn", "penis", "vodka", "booze", "heroin"])
      expect(shown.has(word), word).toBe(false);
    for (const word of ["beer", "wine", "kill", "murder", "pistol", "rifle", "cigar", "blood", "naked", "ugly"])
      expect(shown.has(word), word).toBe(true);
  });
});
