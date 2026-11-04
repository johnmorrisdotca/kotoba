#!/usr/bin/env node
/**
 * WRITES THE ENGLISH WORD MEANINGS from Open English WordNet, so the lists are machine
 * output anybody can make again, never hand-kept tables.
 *
 *   curl -sL -o oewn.xml.gz https://github.com/globalwordnet/english-wordnet/releases/download/2025-edition/english-wordnet-2025.xml.gz
 *   node scripts/word-meanings-en.mjs oewn.xml.gz
 *
 * Open English WordNet is the Open English WordNet team's, under the Creative Commons Attribution 4.0 licence, and
 * derived from Princeton WordNet 3.1, whose licence lets anyone "use, copy, modify and distribute this software and
 * database and its documentation for any purpose and without fee or royalty" provided its notice and disclaimer
 * appear on all copies (NOTICE.md carries both). The lists made here are derived works under the same terms.
 *
 * One list for each length of the English game (src/lists/meanings-en-N.data.ts), one row for each word of
 * src/lists/words-en.data.ts that has a meaning: the word, a tab, and a plain line of at most 70 characters.
 *
 * - The line is the definition of the first sense of the word's first entry, a noun before a verb before an adjective before an
 *   adverb (WordNet orders senses by use, and the file has no counts to compare entries by), cut at the first semicolon and, if
 *   still long, at a word.
 * - A word that is not an entry itself but is a regular form of one (arms, walked, taller) or one of the entry's irregular
 *   forms (ate) shows the entry's line after "plural of arm:", "past form of walk:" and so on.
 * - Children play: a word is left out when it or its line says it is vulgar, offensive, derogatory, obscene or a slur, or names
 *   sex, killing, violence or the body parts and functions a child's dictionary skips. The line is the first sense only, so a
 *   word with a rude sense further down (blue, screw) keeps its first.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";
import { writeWordList } from "./word-list-docs.mjs";

const [FILE] = process.argv.slice(2);
if (FILE === undefined) {
  console.error("Usage: node scripts/word-meanings-en.mjs <english-wordnet-2025.xml.gz>");
  process.exit(1);
}
const { EN_WORDS } = await import(pathToFileURL("src/lists/words-en.data.ts").href);

const xml = gunzipSync(readFileSync(FILE)).toString("utf8");
const release = /<Lexicon [^>]*version="([^"]+)"/.exec(xml)?.[1];
if (release === undefined) throw new Error("No version in the file.");
const decode = (text) =>
  text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");

const definitions = new Map();
for (const match of xml.matchAll(/<Synset id="([^"]*)"[^>]*>([\s\S]*?)<\/Synset>/g)) {
  const text = /<Definition>([\s\S]*?)<\/Definition>/.exec(match[2])?.[1];
  if (text !== undefined) definitions.set(match[1], decode(text.trim()));
}

/** word -> its entries, each with its part of speech, its senses' synsets and its irregular forms. */
const entries = new Map();
const irregular = new Map();
for (const match of xml.matchAll(
  /<LexicalEntry id="[^"]*">\s*<Lemma writtenForm="([^"]*)" partOfSpeech="(\w)"(?:\/>|>[\s\S]*?<\/Lemma>)([\s\S]*?)<\/LexicalEntry>/g,
)) {
  const word = decode(match[1]);
  if (!/^[a-z]+$/.test(word)) continue;
  const senses = [...match[3].matchAll(/<Sense [^>]*synset="([^"]*)"/g)].map((one) => one[1]);
  if (senses.length === 0) continue;
  const entry = { word, pos: match[2], senses };
  entries.set(word, [...(entries.get(word) ?? []), entry]);
  for (const form of match[3].matchAll(/<Form writtenForm="([^"]*)"/g)) {
    const spelled = decode(form[1]);
    if (/^[a-z]+$/.test(spelled)) irregular.set(spelled, [...(irregular.get(spelled) ?? []), entry]);
  }
}

const NOT_FOR_CHILDREN =
  /\b(vulgar|obscene|offensive|derogatory|disparag\w*|slur|pejorative|sexual\w*|sex appeal|has sex|have sex|having sex|sex cells|gigolo\w*|damn\w*|expletive\w*|hells?|drunk\w*|inebriat\w*|intoxicat\w*|erotic\w*|genital\w*|penis|vagina|testicle\w*|breast\w*|buttock\w*|anus|excrement\w*|feces|faeces|urinat\w*|urine|fornicat\w*|prostitut\w*|whore\w*|rape\w*|kill\w*|murder\w*|slay\w*|suicid\w*|tortur\w*|massacre\w*|lust\w*|nude|naked|pornograph\w*|orgasm\w*|masturbat\w*|intercourse|copulat\w*|mistress|concubine|brothel)\b/i;
const LONGEST = 70;

/** The line for a definition: up to the first semicolon, and a word's end if that is still long. */
function lineOf(definition) {
  let line = definition.split(";")[0].replace(/\s+/g, " ").trim();
  if (line.length > LONGEST) line = `${line.slice(0, LONGEST - 1).replace(/\s+\S*$/, "")}…`;
  return line;
}

/** The first entry of a word: a noun before a verb before an adjective before an adverb. */
function commonest(list) {
  return [...list].sort((a, b) => "nvasr".indexOf(a.pos) - "nvasr".indexOf(b.pos))[0];
}

/** null when nothing is to be shown: no entry, no definition, or a word or a line that is not for children. */
function ownLine(list) {
  const entry = commonest(list);
  const first = definitions.get(entry.senses[0]);
  if (first === undefined || first === "" || NOT_FOR_CHILDREN.test(first) || NOT_FOR_CHILDREN.test(entry.word))
    return null;
  return lineOf(first);
}

const RULES = [
  // [suffix, base's ending, part of speech of the base, label]
  ["ies", "y", "n", "plural of"],
  ["ies", "y", "v", "form of"],
  ["es", "", "n", "plural of"],
  ["es", "", "v", "form of"],
  ["s", "", "n", "plural of"],
  ["s", "", "v", "form of"],
  ["ied", "y", "v", "past form of"],
  ["ed", "", "v", "past form of"],
  ["ed", "e", "v", "past form of"],
  ["ing", "", "v", "-ing form of"],
  ["ing", "e", "v", "-ing form of"],
  ["er", "", "a", "comparative of"],
  ["er", "e", "a", "comparative of"],
  ["ier", "y", "a", "comparative of"],
  ["est", "", "a", "superlative of"],
  ["est", "e", "a", "superlative of"],
  ["iest", "y", "a", "superlative of"],
];

function lineFor(word) {
  const own = entries.get(word);
  if (own !== undefined) return ownLine(own);
  for (const entry of irregular.get(word) ?? []) {
    const line = ownLine(entries.get(entry.word));
    if (line !== null) return `form of ${entry.word}: ${line}`;
  }
  for (const [suffix, ending, pos, label] of RULES) {
    if (!word.endsWith(suffix) || word.length - suffix.length < 2) continue;
    const base = `${word.slice(0, word.length - suffix.length)}${ending}`;
    const list = (entries.get(base) ?? []).filter((entry) => entry.pos === pos || (pos === "a" && entry.pos === "s"));
    if (list.length === 0) continue;
    const line = ownLine(entries.get(base));
    if (line !== null) return `${label} ${base}: ${line}`;
  }
  return null;
}

const NOTICE = ` * Open English WordNet ${release} (https://en-word.net/), Copyright the Open English WordNet team, is licensed under the
 * Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/). It is derived from
 * WordNet 3.1, Copyright 2011 by Princeton University. All rights reserved. THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND
 * PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION,
 * PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT
 * THE USE OF THE LICENSED SOFTWARE, DATABASE OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS
 * OR OTHER RIGHTS. The name of Princeton University or Princeton may not be used in advertising or publicity pertaining to
 * distribution of the software and/or database. Title to copyright in this software, database and any associated documentation
 * shall at all times remain with Princeton University and LICENSEE agrees to preserve same. This list is derived from it, under
 * the same licence.`;

for (const [size, lists] of Object.entries(EN_WORDS)) {
  const words = [
    ...new Set([lists.easy, lists.answers, lists.allowed].flatMap((text) => text.split(/\s+/).filter(Boolean))),
  ].sort();
  const rows = [];
  let barred = 0;
  for (const word of words) {
    const line = lineFor(word);
    if (line === null) {
      if (entries.has(word)) barred += 1;
      continue;
    }
    if (/[\t\n]/.test(line)) throw new Error(`A separator in the line for ${word}.`);
    rows.push(`${word}\t${line}`);
  }
  if (rows.length < 300) throw new Error(`Far too few meanings for ${size} letters: read the source.`);
  writeWordList(
    `src/lists/meanings-en-${size}.data.ts`,
    `/**
 * THE ENGLISH MEANINGS OF ${size}-LETTER WORDS. Written by \`scripts/word-meanings-en.mjs\` from Open English WordNet ${release}.
 * Never edited by hand; run the script again instead.
 *
${NOTICE}
 *
 * ${rows.length} of the ${words.length} words of the ${size}-letter English lists have a meaning; each row is the word, a tab and a short line.
 */
export const EN_MEANINGS_${size} = {
  release: ${JSON.stringify(release)},
  rows: ${JSON.stringify(rows.join("\n"))},
};
`,
  );
  console.log(
    `${size} letters: ${rows.length} of ${words.length} words have a meaning (${barred} left out as not for children)`,
  );
}
