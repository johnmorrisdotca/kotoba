/**
 * THE BAR ON WHAT IS NOT FOR A CHILD: one place, used by every script that writes a list (children play these games).
 *
 * Japanese (JMdict): `japaneseBar(entry, scope)` says why a dictionary entry is kept out, or null. Two reasons.
 * - A MARK: JMdict marks a sense vulgar, X-rated, sensitive or derogatory.
 * - A GLOSS: a gloss names sex or the sex trade, which JMdict does not always mark (朝雲暮雨 is "sexual liaison").
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

/** A gloss that names sex or the sex trade. */
export const ADULT_GLOSS =
  /\b(sex|sexual|sexually|erection|genital\w*|penis|vagina|vulva|clitoris|testicle\w*|pubic|semen|sperm(?!\s+whales?)|orgasm\w*|ejaculat\w*|masturbat\w*|fellatio|cunnilingus|copulat\w*|fornicat\w*|promiscuous|incest\w*|rape[sd]?|raping|rapist|pornograph\w*|erotic\w*|lewd|prostitut\w*|whore|brothel|bordello|pimp|mistress(?!\s*\(?of\b)|concubine|courtesan|adulter\w*|lustful|nipple)\b/i;

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
  if (ADULT_GLOSS.test(glossesIn(text).join(" ; "))) return "gloss";
  return null;
}

/**
 * Words never hidden as an answer, found by scanning the lists at these lengths, not guessed blind. English: slurs, vulgarity,
 * anything sexual, drink, drugs, killing, insults a player could read as aimed at them. French and German: the same, and
 * a French word an English reader sees as vulgar ("rape", a grater), and the words a slur is most often made of.
 */
const WORDS = {
  en: `arse arsed bitch boner boobs booby boob butt butts crap cunt damn dick dicks dildo dyke fag fags fart farts fuck
  fucks gook hell piss pissy shit slut sluts spic tits titty turd twat wank whore pussy prick horny bimbo homo negro
  kike pimp porn rape raped rapes sexy penis semen sperm anal anus coon dago gypsy honky jizz kinky nazi queer skank
  slag spunk tramp wench wop bong booze crack weed pee poop puke vomit pubic nude nudes lust lusty balls ballsy bust
  busty strip chink lynch noose orgy lewd smut hump booty thong puss coke dope moron idiot scum
  bugger condom erotic faggot harlot heroin incest molest nipple orgasm raping rapist sexing sexism sexist sexual sodomy
  vagina rectum rectal testis herpes fetish pantie hooter crotch nudity virgin virile carnal seduce lewder sadism sadist
  junkie puking racism racist stupid dumber sucker cretin midget retard weirdo nitwit breast abuser
  vodka beer beers wine wines rum vape drugs drug kill murder blood gore
  brew drunk lager cider tipsy brandy liquor sherry whisky whiskey gin ale
  cigar smoker opium addict
  stab slay slain bloody corpse pistol rifle dagger weapon bomb shoot bullet kidnap abuse
  rump teat snot dung groin udder feces urine naked manure
  dumb ugly jerk loser fatty slave`,
  fr: `anal baise bite cocu conne cons fesse merde negre negro nique penis pute putes salop seins vagin zizi homo porno hymen
pede pine bitte etron beuh tapin rape boche ducon clito fion caca pipi vomi fatma nazi teton chier garce sucer viol sexe idiot
bander bordel chiant chieur encule foutre gerber gouine niquer nichon pisser putain salaud salope sperme nympho gigolo libido
luxure sexuel suceur gammee fuhrer hetero pubien uretre uriner fesser fessee lecher violer verole herpes puceau vierge salace
extase toxico debile cretin abruti batard tocard ignare neuneu crotte ordure soutif capote voyeur degueu rectum gyneco youpin
ricain romano
  juif juive eskimo
  sexe sexy viol putain fesses
  rhum ivre saoul boire biere vodka whisky alcool tabac fumer cigare drogue sein tuer sang fusil bombe`,
  de: `arsch fick fickt fotze geil geile hure huren kacke kotze mist neger nutte pisse milf after lesbe porno penis vulva titte
ficke dirne tunte puff popo zicke luder depp busen tussi idiot
bumsen ficken vögeln muschi pimmel nippel pissen pisser kotzen furzen koitus kondom erotik libido vagina voyeur domina inzest
geilen kiffen kiffer koksen kokain heroin psycho prolet lusche penner fatzke dussel zicken zickig fresse schwul pfaffe suizid
tampon saufen säufer schiss pinkel poppen eunuch
  jude arier moslem türken eskimo
  sexy ficken
  bier wein mord blut nackt brust töten waffe bombe droge tabak whisky`,
};

const SETS = Object.fromEntries(
  Object.entries(WORDS).map(([language, words]) => [language, new Set(words.split(/\s+/).filter(Boolean))]),
);

/** Whether a word is never hidden as an answer. */
export const wordBar = (word, language = "en") => SETS[language]?.has(word) ?? false;

/** Words of one language the bar names, for a script that needs them (a set, not to be changed). */
export const barredWords = (language) => SETS[language];

/**
 * What a short English line, or the word it explains, may not say: vulgar, offensive, sexual, violent, drink, drugs,
 * a body's private matters. A word that is not an entry itself shows the line of the entry it comes from, so the check
 * applies to that line too.
 */
export const NOT_FOR_CHILDREN =
  /\b(vulgar|obscene|offensive|derogatory|disparag\w*|slur|pejorative|insulting|sexual\w*|sex appeal|has sex|have sex|having sex|sex cells|gigolo\w*|damn\w*|expletive\w*|hells?|drunk\w*|inebriat\w*|intoxicat\w*|erotic\w*|genital\w*|penis|vagina|testicle\w*|breast\w*|buttock\w*|rump|groin|nipple|anus|excrement\w*|feces|faeces|dung|manure|fecal|snot|barf|vomit\w*|urinat\w*|urine|fornicat\w*|prostitut\w*|whore\w*|rape[sd]?|raping|rapist|kill\w*|murder\w*|slay\w*|slain|stab\w*|suicid\w*|tortur\w*|massacre\w*|lust\w*|nude|naked|pornograph\w*|orgasm\w*|masturbat\w*|intercourse|copulat\w*|mistress|concubine|brothel|alcohol\w*|beers?|wines?|liquors?|whisk(?:e)?y|brandy|vodka|rum|gin|booze|boozy|cocktails?|ales?|cider|drinkers?|tobacco|cigar\w*|cigarette|vape|marijuana|narcotic\w*|drugs?|opium|heroin|cocaine|weapons?|guns?|firearms?|rifles?|pistol|bomb|dagger|violen\w*|bloody|bloodshed|gore|gory|corpse|abuse|assault\w*|slave\w*|stupid|idiot|moron|imbecile)\b/i;

/** Whether a short English line, or the word it is for, is not for children. */
export const lineBar = (text) => NOT_FOR_CHILDREN.test(text);
