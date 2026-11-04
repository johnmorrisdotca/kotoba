// What a Japanese guess means, for the demo: Jisho (@johnmorrisdotca/jisho), the family's dictionary of Japanese words, in its default
// safe mode, which leaves out what JMdict marks vulgar, X-rated, sensitive or derogatory and never fetches the files that hold it.
// Kotoba holds no dictionary and does not depend on one: the game takes a `meanings(word, words)` function, and this is
// the demo's. Jisho is a development dependency of the demo only, and site.mjs copies the few files this needs into site/jisho/.
// A reading that several words share shows the commonest two or three with their written forms ("紙 paper · 神 god · 髪 hair"),
// kept to about 60 characters. English uses the package's own meanings (Open English WordNet); French and German show nothing yet.
import { englishMeaning } from "./dist/meaningsEn.js";
import { loadWords, wordsOf } from "./jisho/words.js";

/** The longest line, in characters, and the longest each entry may be when there are several. */
const LONGEST = 60;
const EACH = 22;
const SEPARATOR = " · ";
/** Kotoba's own word list, on top of Jisho's safe mode, which keeps no list of words: a line that says one of these is not shown, though JMdict does not mark it. */
const NOT_FOR_CHILDREN =
  /\b(kill\w*|murder\w*|slay\w*|suicid\w*|sex\w*|rape\w*|genital\w*|prostitut\w*|abus\w*|torture\w*|massacre)\b/i;

/** The first plain gloss of a meaning: "god, deity, divinity; god-tier" is "god"; a note in brackets is dropped. */
function firstGloss(meaning) {
  const gloss = meaning
    .split(";")[0]
    .split(",")[0]
    .replace(/\s*\([^)]*\)/g, "")
    .trim();
  return gloss.length > EACH ? `${gloss.slice(0, EACH - 1).replace(/\s+\S*$/, "")}…` : gloss;
}

/** The line for a reading from the words Jisho has for it, commonest first, or null when there is nothing to show. */
export function lineOf(reading, found) {
  const seen = new Set();
  const parts = [];
  for (const word of found) {
    const gloss = firstGloss(word.meaning);
    if (gloss === "" || gloss.endsWith("…") || NOT_FOR_CHILDREN.test(word.meaning) || seen.has(gloss.toLowerCase()))
      continue;
    seen.add(gloss.toLowerCase());
    // A word with no kanji, or written here as its reading, is shown as its meaning alone.
    parts.push(
      word.written === reading || /^[ぁ-ゖァ-ヺー]+$/u.test(word.written) ? gloss : `${word.written} ${gloss}`,
    );
    if (parts.length === 3) break;
  }
  for (let count = parts.length; count > 0; count -= 1) {
    const line = parts.slice(0, count).join(SEPARATOR);
    if ([...line].length <= LONGEST) return line;
  }
  return parts[0] === undefined ? null : `${[...parts[0]].slice(0, LONGEST - 1).join("")}…`;
}

/**
 * The `meanings` option of `mountKotoba`: kana words are looked up as readings in Jisho, English words in the package's own
 * `englishMeaning` (Open English WordNet); French and German say nothing yet.
 */
export async function jishoMeanings(word, words) {
  if (words === "en") return englishMeaning(word, words);
  if (words !== "ja") return null;
  return lineOf(word, wordsOf(await loadWords(word), word));
}
