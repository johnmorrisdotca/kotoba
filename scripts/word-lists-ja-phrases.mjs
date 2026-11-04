#!/usr/bin/env node
/**
 * WRITES THE JAPANESE IDIOMS, THE SHIRITORI WORDS, THE PROVERBS AND THE FOUR-CHARACTER
 * COMPOUNDS from JMdict, so every list is machine output anybody can make again, never
 * hand-kept tables.
 *
 *   curl -sL -o JMdict_e.gz http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz
 *   curl -sL -o kanjidic2.xml.gz http://ftp.edrdg.org/pub/Nihongo/kanjidic2.xml.gz
 *   node scripts/word-lists-ja-phrases.mjs JMdict_e.gz kanjidic2.xml.gz
 *
 * Both files are the Electronic Dictionary Research and Development Group's,
 * under CC BY-SA 4.0 with the Group's conditions
 * (https://www.edrdg.org/edrdg/licence.html, read 2026-10-31). The lists made
 * here are derived works under the same licence; see NOTICE.md.
 *
 * THE IDIOMS (src/lists/idioms-ja.data.ts) come in two kinds, and every row says
 * which, because a reader deserves to know whose judgement put it there:
 *
 * - `idiom`: an entry JMdict itself marks idiomatic (misc `&id;`). The meanings are
 *   the plain glosses of the sense that carries the mark, since the first sense of
 *   an entry may be the literal one: 胡坐をかく first means "to sit cross-legged".
 * - `expression`: this package's own rule, for what JMdict files as a plain
 *   expression though it is what a school teaches as an idiom. A JMdict `exp`
 *   with a verb or adjective tag, written as a body part, 気 or an animal, then a
 *   particle, then a predicate, whose first plain gloss says nothing about the
 *   thing itself: 鼻が高い ("proud") is taken and 手を洗う ("to wash one's hands")
 *   is not.
 *
 * `elementary` says every kanji in the written form is one of the 1,026 taught
 * in Japanese elementary school (KANJIDIC2's grades 1 to 6), or that it has none.
 * `common` says JMdict marks the entry as a common word. Neither is a syllabus:
 * nobody published a list of the idioms a fourth-year is taught under terms we
 * can use, so nothing here pretends to one.
 *
 * THE SHIRITORI WORDS (src/lists/shiritori-ja.data.ts) are the nouns of JMdict's
 * textbook-common list (ichi1), one row a reading, commonest first by the
 * newspaper frequency bands. JMdict decides what is a word; the bands only rank.
 *
 * THE PROVERBS (src/lists/proverbs-ja.data.ts) are the entries JMdict marks as proverbs
 * (misc `&proverb;`) and THE FOUR-CHARACTER COMPOUNDS (src/lists/yojijukugo-ja.data.ts) the
 * entries it marks as yojijukugo (misc `&yoji;`). JMdict decides what is one; this package
 * adds nothing. The meanings are the plain glosses of the sense that carries the mark.
 *
 * Every list leaves out what JMdict marks vulgar, X-rated, sensitive or derogatory:
 * these lists turn up in children's games. An idiom, proverb or compound is left out for
 * such a mark on any of its senses, a shiritori word for one on its first sense. A proverb or
 * compound is also left out when any gloss of its entry names sex or the sex trade, which
 * JMdict does not always mark (朝雲暮雨 is "sexual liaison", unmarked).
 */
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { writeWordList } from "./word-list-docs.mjs";

const [JMDICT, KANJIDIC] = process.argv.slice(2);
if (JMDICT === undefined || KANJIDIC === undefined) {
  console.error("Usage: node scripts/word-lists-ja-phrases.mjs <JMdict_e.gz> <kanjidic2.xml.gz>");
  process.exit(1);
}
for (const file of [JMDICT, KANJIDIC])
  if (!existsSync(file)) {
    console.error(`No such file: ${file}`);
    process.exit(1);
  }

const NOT_FOR_EVERYONE = /&(vulg|X|sens|derog);/;
const ADULT_GLOSS =
  /\b(sex|sexual|sexually|erection|genital\w*|penis|vagina|prostitut\w*|whore|brothel|mistress|concubine|courtesan|adulter\w*|lustful|nipple)\b/i;
const HAN = /\p{Script=Han}/u;
const KATAKANA = /\p{Script=Katakana}/u;
const ONLY_KANA = /^[ぁ-ゖァ-ヶー]+$/u;
const SHORTEST_PHRASE = 4;
const SHORTEST_WORD = 2;

/** The body parts, 気 and animals the expression rule starts from, each with the English that would make a gloss literal. */
const HEADWORDS = {
  頭: ["head"],
  顔: ["face"],
  目: ["eye"],
  鼻: ["nose"],
  口: ["mouth"],
  耳: ["ear"],
  歯: ["tooth", "teeth"],
  舌: ["tongue"],
  首: ["neck"],
  肩: ["shoulder"],
  腕: ["arm"],
  手: ["hand"],
  指: ["finger"],
  胸: ["chest", "breast"],
  腹: ["belly", "stomach"],
  背: ["back"],
  腰: ["waist", "hip", "lower back"],
  足: ["foot", "feet", "leg"],
  尻: ["buttock", "bottom", "rear"],
  骨: ["bone"],
  血: ["blood"],
  肝: ["liver"],
  心: ["heart"],
  眉: ["eyebrow"],
  唇: ["lip"],
  喉: ["throat"],
  爪: ["nail", "claw"],
  膝: ["knee"],
  肘: ["elbow"],
  毛: ["hair"],
  髪: ["hair"],
  皮: ["skin"],
  肌: ["skin"],
  身: ["body"],
  面: ["face"],
  気: ["spirit", "mind", "feeling"],
  馬: ["horse"],
  犬: ["dog"],
  猫: ["cat"],
  牛: ["cow", "cattle", "ox"],
  虫: ["insect", "bug", "worm"],
  鳥: ["bird"],
  魚: ["fish"],
  猿: ["monkey", "ape"],
  狐: ["fox"],
  狸: ["raccoon", "tanuki"],
  蛇: ["snake"],
  熊: ["bear"],
  鶴: ["crane"],
  亀: ["turtle", "tortoise"],
  鶏: ["chicken"],
  豚: ["pig"],
  羊: ["sheep"],
  鹿: ["deer"],
  象: ["elephant"],
  虎: ["tiger"],
  竜: ["dragon"],
  龍: ["dragon"],
  蛙: ["frog"],
  蟻: ["ant"],
  蜂: ["bee", "wasp"],
  鼠: ["mouse", "rat"],
  兎: ["rabbit", "hare"],
  雀: ["sparrow"],
  鷹: ["hawk"],
  鯉: ["carp"],
  鯨: ["whale"],
  蝶: ["butterfly"],
  蚊: ["mosquito"],
};
const PARTICLE = /[がをにのはも]/;
const PREDICATE = /<pos>&(v[0-9a-z-]*|adj-[a-z]+);<\/pos>/;

const decode = (text) =>
  text.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&amp;", "&");
const all = (text, tag) =>
  [...text.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"))].map((match) => decode(match[1].trim()));

/** The written form to show: what the dictionary lists first, past search-only and irregular spellings, preferring one with no katakana. */
function writtenForm(entry) {
  const forms = [...entry.matchAll(/<k_ele>[\s\S]*?<\/k_ele>/g)]
    .map((match) => match[0])
    .filter((form) => !/&(sK|iK|oK|io|ik);/.test(form))
    .flatMap((form) => all(form, "keb"));
  return forms.find((form) => !KATAKANA.test(form)) ?? forms[0] ?? null;
}

/** The first reading that applies to the written form, past search-only ones. */
function readingOf(entry, written) {
  for (const match of entry.matchAll(/<r_ele>[\s\S]*?<\/r_ele>/g)) {
    const element = match[0];
    if (/&(sk|ik|ok);/.test(element)) continue;
    const only = all(element, "re_restr");
    if (only.length > 0 && !only.includes(written)) continue;
    return all(element, "reb")[0];
  }
  return all(entry, "reb")[0] ?? null;
}

/** The plain glosses of a sense, the one to show first: none is a literal rendering or an explanation, and the first is not led by a bracketed note. */
function glossesOf(sense) {
  const glosses = [...sense.matchAll(/<gloss(\s[^>]*)?>([\s\S]*?)<\/gloss>/g)].map((match) => ({
    typed: match[1] !== undefined && /g_type="(lit|expl|fig|tm)"/.test(match[1]),
    text: decode(match[2].trim()),
  }));
  const plain = glosses.filter((gloss) => !gloss.typed && gloss.text !== "");
  const kept = (plain.length > 0 ? plain : glosses).map((gloss) => gloss.text).filter((text) => text !== "");
  const first = kept.find((text) => !text.startsWith("(")) ?? kept[0];
  return first === undefined ? [] : [first, ...kept.filter((text) => text !== first)];
}

const sensesOf = (entry) => [...entry.matchAll(/<sense>[\s\S]*?<\/sense>/g)].map((match) => match[0]);

function takenAsExpression(entry, written, meaning) {
  if (!entry.includes("&exp;") || !PREDICATE.test(entry)) return false;
  const characters = [...written];
  if (characters.length < SHORTEST_PHRASE) return false;
  const literal = HEADWORDS[characters[0]];
  if (literal === undefined || !PARTICLE.test(characters[1])) return false;
  const lower = meaning.toLowerCase();
  return !literal.some((word) => lower.includes(word));
}

/** The newspaper frequency band, 1 the commonest; 99 for a word in no band. */
const bandOf = (entry) =>
  Math.min(99, ...[...entry.matchAll(/<(?:ke|re)_pri>nf(\d\d)<\/(?:ke|re)_pri>/g)].map((match) => Number(match[1])));

const jmdict = gunzipSync(readFileSync(JMDICT)).toString("utf8");
const release = /<!-- JMdict created: (\d{4}-\d{2}-\d{2}) -->/.exec(jmdict)?.[1];
if (release === undefined) throw new Error("No JMdict release date in the file.");

const kanjidic = gunzipSync(readFileSync(KANJIDIC)).toString("utf8");
const kanjidicRelease = /<date_of_creation>(\d{4}-\d{2}-\d{2})<\/date_of_creation>/.exec(kanjidic)?.[1];
if (kanjidicRelease === undefined) throw new Error("No KANJIDIC2 release date in the file.");
const taught = new Set();
for (const match of kanjidic.matchAll(/<character>[\s\S]*?<\/character>/g)) {
  const grade = Number(/<grade>(\d+)<\/grade>/.exec(match[0])?.[1] ?? 0);
  if (grade >= 1 && grade <= 6) taught.add(/<literal>([\s\S]*?)<\/literal>/.exec(match[0])[1]);
}
if (taught.size !== 1026) throw new Error(`KANJIDIC2 gives ${taught.size} elementary kanji, not 1,026: read it.`);

const idioms = new Map();
const words = new Map();
const sayings = { proverb: new Map(), yoji: new Map() };
const leftOut = { idioms: [], words: 0, proverb: [], yoji: [] };

for (const match of jmdict.matchAll(/<entry>[\s\S]*?<\/entry>/g)) {
  const entry = match[0];
  const written = writtenForm(entry);
  const reading = readingOf(entry, written);
  if (reading === null || reading === undefined) continue;
  const word = written ?? reading;
  const senses = sensesOf(entry);
  const barred = NOT_FOR_EVERYONE.test(entry);

  const marked = senses.find((sense) => sense.includes("&id;"));
  const meanings = glossesOf(marked ?? senses[0] ?? "");
  const meaning = meanings[0];
  if (meaning !== undefined) {
    const kind =
      marked !== undefined
        ? "idiom"
        : written !== null && takenAsExpression(entry, written, meaning)
          ? "expression"
          : null;
    if (kind !== null) {
      if (barred) leftOut.idioms.push(word);
      else if (!idioms.has(word)) {
        const kanji = [...word].filter((character) => HAN.test(character));
        idioms.set(word, {
          idiom: word,
          reading,
          meanings,
          kind,
          elementary: kanji.every((character) => taught.has(character)),
          common: /<(?:ke|re)_pri>/.test(entry),
        });
      }
    }
  }

  for (const [kind, mark] of [
    ["proverb", "&proverb;"],
    ["yoji", "&yoji;"],
  ]) {
    const carrying = senses.find((sense) => sense.includes(mark));
    const glosses = carrying === undefined ? [] : glossesOf(carrying);
    if (glosses.length === 0 || sayings[kind].has(word)) continue;
    if (barred || ADULT_GLOSS.test(all(entry, "gloss").join(" "))) {
      leftOut[kind].push(word);
      continue;
    }
    const kanji = [...word].filter((character) => HAN.test(character));
    sayings[kind].set(word, {
      text: word,
      reading,
      meanings: glosses,
      elementary: kanji.every((character) => taught.has(character)),
      common: /<(?:ke|re)_pri>/.test(entry),
    });
  }

  // A shiritori word: an everyday noun, its first sense a plain noun.
  const first = senses[0] ?? "";
  if (!/<(?:ke|re)_pri>ichi1</.test(entry) || !first.includes("<pos>&n;</pos>")) continue;
  if (first.includes("&exp;") || first.includes("&n-pr;")) continue;
  // The first sense decides here: 犬 is a dog, whatever else JMdict says it can be called.
  if (NOT_FOR_EVERYONE.test(first) || /&(arch|obs|rare|hist);/.test(first)) {
    leftOut.words += 1;
    continue;
  }
  if (
    !ONLY_KANA.test(reading) ||
    [...reading].length < SHORTEST_WORD ||
    /^[ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ]/u.test(reading)
  )
    continue;
  const gloss = glossesOf(first)[0];
  if (gloss === undefined) continue;
  const band = bandOf(entry);
  const held = words.get(reading);
  if (held === undefined || band < held.band) words.set(reading, { reading, word, meaning: gloss, band });
}

const byReading = (a, b) => (a.reading < b.reading ? -1 : a.reading > b.reading ? 1 : 0);
const idiomRows = [...idioms.values()].sort(byReading);
const counts = {
  idiom: idiomRows.filter((row) => row.kind === "idiom").length,
  expression: idiomRows.filter((row) => row.kind === "expression").length,
  elementary: idiomRows.filter((row) => row.elementary).length,
  common: idiomRows.filter((row) => row.common).length,
};
const sayingRows = Object.fromEntries(
  Object.entries(sayings).map(([kind, rows]) => [kind, [...rows.values()].sort(byReading)]),
);
const sayingCounts = Object.fromEntries(
  Object.entries(sayingRows).map(([kind, rows]) => [
    kind,
    { elementary: rows.filter((row) => row.elementary).length, common: rows.filter((row) => row.common).length },
  ]),
);
const wordRows = [...words.values()].sort((a, b) => a.band - b.band || byReading(a, b));
if (counts.idiom < 1000 || wordRows.length < 3000 || sayingRows.proverb.length < 800 || sayingRows.yoji.length < 1500)
  throw new Error("JMdict gave far too few rows: read the source.");
for (const row of wordRows)
  if (/[\t\n]/.test(row.word + row.reading + row.meaning)) throw new Error(`A separator in the row for ${row.word}.`);

const NOTICE = (what) => ` * JMdict and KANJIDIC2 are the property of the Electronic Dictionary Research and
 * Development Group (EDRDG), used under the Creative Commons Attribution-ShareAlike
 * 4.0 licence and the Group's conditions: https://www.edrdg.org/edrdg/licence.html.
 * ${what} derived from them and under the same licence.`;

writeWordList(
  "src/lists/idioms-ja.data.ts",
  `import type { PackedIdioms } from "../phrases.ts";

/**
 * THE JAPANESE IDIOMS. Written by \`scripts/word-lists-ja-phrases.mjs\` from JMdict,
 * release ${release}, and KANJIDIC2, ${kanjidicRelease}. Never edited by hand; the monthly refresh
 * (.github/workflows/jmdict-refresh.yml) runs the script again.
 *
${NOTICE("This list is")}
 *
 * ${counts.idiom} that JMdict marks idiomatic and ${counts.expression} expressions taken by this package's own rule;
 * ${counts.elementary} written only in kanji taught in elementary school; ${counts.common} marked common.
 */
export const JA_IDIOMS: PackedIdioms = {
  release: ${JSON.stringify(release)},
  idioms: ${JSON.stringify(
    idiomRows.map(({ idiom, reading, meanings, kind, elementary, common }) => [
      idiom,
      reading,
      meanings,
      kind === "idiom" ? 1 : 0,
      elementary ? 1 : 0,
      common ? 1 : 0,
    ]),
  )},
};
`,
);

writeWordList(
  "src/lists/shiritori-ja.data.ts",
  `/**
 * THE SHIRITORI WORDS. Written by \`scripts/word-lists-ja-phrases.mjs\` from JMdict,
 * release ${release}. Never edited by hand; the monthly refresh
 * (.github/workflows/jmdict-refresh.yml) runs the script again.
 *
${NOTICE("This list is")}
 *
 * ${wordRows.length} nouns of JMdict's textbook-common list, one a reading, commonest first. Each row is
 * reading, word and meaning, separated by tabs (\`readShiritoriWords\` reads them).
 */
export const JA_SHIRITORI = {
  release: ${JSON.stringify(release)},
  rows: ${JSON.stringify(wordRows.map((row) => `${row.reading}\t${row.word}\t${row.meaning}`).join("\n"))},
};
`,
);

const SAYINGS = [
  ["proverb", "proverbs-ja", "JA_PROVERBS", "THE PROVERBS", "entries JMdict marks as proverbs"],
  ["yoji", "yojijukugo-ja", "JA_YOJIJUKUGO", "THE FOUR-CHARACTER COMPOUNDS", "entries JMdict marks as yojijukugo"],
];
for (const [kind, entry, name, title, what] of SAYINGS) {
  const rows = sayingRows[kind];
  writeWordList(
    `src/lists/${entry}.data.ts`,
    `import type { PackedSayings } from "../phrases.ts";

/**
 * ${title}. Written by \`scripts/word-lists-ja-phrases.mjs\` from JMdict,
 * release ${release}, and KANJIDIC2, ${kanjidicRelease}. Never edited by hand; the monthly refresh
 * (.github/workflows/jmdict-refresh.yml) runs the script again.
 *
${NOTICE("This list is")}
 *
 * ${rows.length} ${what}, one a written form, in the order of the reading;
 * ${sayingCounts[kind].elementary} written only in kanji taught in elementary school; ${sayingCounts[kind].common} marked common.
 */
export const ${name}: PackedSayings = {
  release: ${JSON.stringify(release)},
  sayings: ${JSON.stringify(
    rows.map(({ text, reading, meanings, elementary, common }) => [
      text,
      reading,
      meanings,
      elementary ? 1 : 0,
      common ? 1 : 0,
    ]),
  )},
};
`,
  );
  console.log(
    `${kind}: ${rows.length} (${sayingCounts[kind].elementary} elementary, ${sayingCounts[kind].common} common); left out as not for everyone: ${leftOut[kind].join(" ")}`,
  );
}

console.log(`JMdict ${release}, KANJIDIC2 ${kanjidicRelease}: ${taught.size} elementary kanji`);
console.log(
  `idioms: ${idiomRows.length} (${counts.idiom} idiom, ${counts.expression} expression, ${counts.elementary} elementary, ${counts.common} common)`,
);
console.log(`left out as not for everyone: ${leftOut.idioms.join(" ")}`);
console.log(`shiritori words: ${wordRows.length} (${leftOut.words} left out by JMdict's marks)`);
