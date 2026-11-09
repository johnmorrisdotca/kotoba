/**
 * THE BAR ON WHAT IS NOT FOR A CHILD: one place, used by every script that writes a list (children play these games).
 *
 * Japanese (JMdict): `japaneseBar(entry, scope)` says why a dictionary entry is kept out, or null. Two reasons.
 * - A MARK: JMdict marks a sense vulgar, X-rated, sensitive or derogatory.
 * - A GLOSS: a gloss names a sex act, a sex organ or the sex trade, which JMdict does not always mark (朝雲暮雨 is "sexual
 *   liaison"). A gloss that only MENTIONS sex never bars (`adultGloss`): 性別 is "sex; gender", 異性 "the opposite sex",
 *   共学 "mixed-sex education", 建立 an "erection" of a temple, 混ぜ物 an "adulteration", 挿入 an "insertion". Ordinary good
 *   words are never filtered out (John, 2026-11-04: "we can't filter out regular good words").
 * `scope` is whose senses count: "all" (idioms, proverbs, compounds: any sense bars the entry) or "first" (shiritori
 * words and kana readings: the first sense is the main meaning, so a word with a rude sense further down keeps its
 * first, as 犬 is a dog whatever else it can be called).
 *
 * English, French and German: `wordBar(word, language)` says whether a word is never hidden as an answer (the lists
 * below), and `lineBar(text)` whether a short English meaning, or the word it explains, is not shown. A word that is
 * barred as an answer may still be guessed: refusing a real word is the one thing a word puzzle must not do.
 */

/** JMdict's marks for a sense that is not for everyone: vulgar, X-rated, sensitive, derogatory. */
export const NOT_FOR_EVERYONE = /&(vulg|X|sens|derog);/;

/** A gloss that names sex or the sex trade, before the neutral uses below are taken out of it (`adultGloss` does both). */
export const ADULT_GLOSS =
  /\b(sex|sexual|sexually|erection|genital\w*|penis|vagina|vulva|clitoris|testicle\w*|pubic|semen|sperm(?!\s+whales?)|orgasm\w*|ejaculat\w*|masturbat\w*|fellatio|cunnilingus|copulat\w*|fornicat\w*|promiscuous|incest\w*|rape[sd]?(?!\s+(?:blossoms?|seeds?|seedlings?|oil|flowers?))|raping|rapist|pornograph\w*|erotic\w*|lewd|prostitut\w*|whore|brothel|bordello|pimp|adulter(?:y|er|ers|ess|ous)|lustful)\b/i;

/**
 * Words that bar only as the FIRST gloss of a sense, where they are what the word means: 妾 is "mistress; kept woman", but
 * 愛人 is "lover; mistress" and 女将 a "proprietress" who is also a "mistress (of a house)". A leading "(mammary)" does not hide a nipple.
 */
export const ADULT_FIRST_GLOSS =
  /^(?:\([^)]*\)\s*)?(?:(?:beloved|favou?rite|secret|kept|foreigner's|a|the)\s+)*(mistress(?!\s*\(?of\b)|kept woman|concubine|courtesan|nipple)\b/i;

/** What a gloss says about sex without naming an act, an organ or the trade: gender, the other or the same sex, biology, school. */
const NEUTRAL_SEX = new RegExp(
  [
    "\\b(?:opposite|same|both|mixed|single|other|either)[- ]sex(?:es)?\\b",
    "\\(distinction of\\) sex\\b",
    "\\bsex(?=\\s*;\\s*gender)",
    "\\bsex[- ](?:ratio|education|difference|chromosomes?|hormones?|pheromones?|discrimination|role|determination|linked|limited|reassignment|characteristics?|glands?|cells?|change|check|testing|selection|preselection)\\b",
    "\\bsexual[- ](?:selection|reproduction|dimorphism|maturation|orientation|minorit\\w+|discrimination|characteristics?|difference|generation|identity|function|gland)\\b",
    "\\bsexual\\s*\\(i\\.e\\. relating to biological sex\\)",
    "\\(sexual\\)(?= penetration)",
  ].join("|"),
  "gi",
);
/** An "erection" that is a building going up, not the body's. */
const BUILDING_WORDS =
  /\b(?:build\w*|construct\w*|assembl\w*|pillars?|monuments?|temples?|palaces?|rebuil\w*|framework)\b/i;

/**
 * Whether the glosses of a sense name a sex act, a sex organ or the sex trade. The neutral uses of the words are taken out
 * first: sex as gender or as the other sex, "sexual selection", an "erection" of a monument, "rape" the plant, an
 * "adulteration", a "(sexual)" in brackets after "insertion".
 */
export function adultGloss(text) {
  const plain = text.replace(NEUTRAL_SEX, " ");
  return ADULT_GLOSS.test(BUILDING_WORDS.test(plain) ? plain.replace(/\berection\b/gi, " ") : plain);
}

/**
 * Readings that are obscene in themselves, barred by the reading alone, because an ordinary word is spelt the same or JMdict
 * marks nothing: まんこ is also 万古, うんこ and おっぱい carry no mark, れいぷ becomes れいふ (霊符) on Kumimoji's tiles. The ordinary
 * entry keeps its other readings (万古 is still ばんこ). Hiragana, as the kana lists write them; the value is the English shown in
 * `scripts/kana-barred.json`.
 */
export const VULGAR_READINGS = new Map([
  ["まんこ", "vulva (vulgar)"],
  ["おまんこ", "vulva (vulgar)"],
  ["うんこ", "poo (vulgar)"],
  ["おっぱい", "breasts (vulgar, childish)"],
  ["ちんこ", "penis (vulgar)"],
  ["ちんぽ", "penis (vulgar)"],
  ["れいぷ", "rape (loanword)"],
]);

const decode = (text) =>
  text.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&amp;", "&");

/** The senses of an entry, as text. */
export const sensesOf = (entry) => [...entry.matchAll(/<sense>[\s\S]*?<\/sense>/g)].map((match) => match[0]);

/** Every gloss of a piece of an entry. */
export const glossesIn = (text) =>
  [...text.matchAll(/<gloss(?:\s[^>]*)?>([\s\S]*?)<\/gloss>/g)].map((match) => decode(match[1].trim()));

/**
 * Why a JMdict entry is not for children: "mark", "gloss", or null when it is fine.
 *
 * @param {string} entry - The entry's XML.
 * @param {"all" | "first"} scope - Whether any sense counts or only the first.
 */
export function japaneseBar(entry, scope = "all") {
  const senses = scope === "first" ? sensesOf(entry).slice(0, 1) : sensesOf(entry);
  const text = senses.join("\n");
  if (NOT_FOR_EVERYONE.test(text)) return "mark";
  if (adultGloss(glossesIn(text).join(" ; "))) return "gloss";
  if (senses.some((sense) => ADULT_FIRST_GLOSS.test(glossesIn(sense)[0] ?? ""))) return "gloss";
  return null;
}

/**
 * Words never hidden as an answer, found by scanning the lists at these lengths, not guessed blind. What is barred is what
 * is not for a child in itself: slurs and insults aimed at a person, profanity and vulgarity, sex, sex organs and the sex
 * trade, and drugs and strong drink. An ordinary word is never barred because its subject is hard: blood, kill, murder,
 * weapon, bomb, naked, nude, urine, ugly, dumb, beer and wine are plain words a child learns early (John, 2026-11-04: "we
 * can't filter out regular good words"). Every one of them may still be GUESSED, barred or not.
 *
 * English, kept barred, and why:
 * - slurs: chink coon dago dyke fag fags faggot gook homo honky kike negro spic wop gypsy nazi queer midget retard cretin.
 * - insults: moron idiot scum nitwit weirdo fatty.
 * - profanity: arse arsed bitch bugger crap cunt damn dick dicks fuck fucks hell piss pissy shit prick twat wank slag.
 * - sex and the sex trade: anal anus boner boobs booby boob busty bimbo carnal condom crotch dildo erotic fart farts
 *   fetish harlot herpes hooter horny incest jizz kinky lewd lust lusty molest nipple orgasm orgy penis pimp porn pubic
 *   pussy puss rape raped rapes raping rapist rectal rectum sadism sadist seduce semen sexing sexual sexy skank slut sluts
 *   smut sodomy spunk sperm testis tits titty turd vagina whore ballsy.
 * - drugs and strong drink: booze bong dope heroin junkie opium vape weed brandy liquor vodka whisky whiskey.
 *
 * French and German: the same, and a French word an English reader sees as vulgar ("rape", a grater), and the words a slur
 * is most often made of.
 */
import { WORDS } from "../src/childrenWords.ts";

const SETS = Object.fromEntries(
  Object.entries(WORDS).map(([language, words]) => [language, new Set(words.split(/\s+/).filter(Boolean))]),
);

/** Whether a word is never hidden as an answer. */
export const wordBar = (word, language = "en") => SETS[language]?.has(word) ?? false;

/** Words of one language the bar names, for a script that needs them (a set, not to be changed). */
export const barredWords = (language) => SETS[language];

/**
 * What a short English line, or the word it explains, may not say: vulgar, offensive, sexual, a sex organ or the sex trade,
 * a slur or an insult, drugs and strong drink, suicide and torture. A word that is not an entry itself shows the line of the
 * entry it comes from, so the check applies to that line too. Plain words are not here: blood, kill, naked, urine, beer.
 */
export const NOT_FOR_CHILDREN =
  /\b(vulgar|obscene|offensive|derogatory|disparag\w*|slur|pejorative|insulting|sexual\w*|sex appeal|has sex|have sex|having sex|gigolo\w*|damn\w*|expletive\w*|erotic\w*|genital\w*|penis|vagina|testicle\w*|nipple|anus|fornicat\w*|prostitut\w*|whore\w*|rape[sd]?|raping|rapist|suicid\w*|tortur\w*|massacre\w*|lustful|lusty|pornograph\w*|orgasm\w*|masturbat\w*|intercourse|copulat\w*|mistress|concubine|brothel|liquors?|whisk(?:e)?y|brandy|vodka|booze|boozy|inebriat\w*|intoxicat\w*|vape|marijuana|narcotic\w*|opium|heroin|cocaine|idiot|moron|imbecile)\b/i;

/** Whether a short English line, or the word it is for, is not for children. */
export const lineBar = (text) => NOT_FOR_CHILDREN.test(text);
