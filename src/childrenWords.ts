/** Hand-made word lists; no dictionary-derived data is included. */
export const WORDS = {
  en: `chink coon dago dyke fag fags faggot gook homo honky kike negro spic wop gypsy nazi queer midget retard cretin
  moron idiot scum nitwit weirdo fatty
  arse arsed bitch bugger crap cunt damn dick dicks fuck fucks hell piss pissy shit prick twat wank slag
  anal anus boner boobs booby boob busty bimbo carnal condom crotch dildo erotic fart farts fetish harlot herpes hooter
  horny incest jizz kinky lewd lust lusty molest nipple orgasm orgy penis pimp porn pubic pussy puss rape raped rapes
  raping rapist rectal rectum sadism sadist seduce semen sexing sexual sexy skank slut sluts smut sodomy spunk sperm
  testis tits titty turd vagina whore ballsy
  booze bong dope heroin junkie opium vape weed brandy liquor vodka whisky whiskey`,
  fr: `anal baise bite cocu conne cons fesse merde negre negro nique penis pute putes salop seins vagin zizi homo porno hymen
pede pine bitte etron beuh tapin rape boche ducon clito fion caca pipi vomi fatma nazi teton chier garce sucer viol sexe idiot
bander bordel chiant chieur encule foutre gerber gouine niquer nichon pisser putain salaud salope sperme nympho gigolo libido
luxure sexuel suceur gammee fuhrer hetero pubien uretre uriner fesser fessee lecher violer verole herpes puceau vierge salace
extase toxico debile cretin abruti batard tocard ignare neuneu crotte ordure soutif capote voyeur degueu rectum gyneco youpin
ricain romano
  juif juive eskimo
  sexe sexy viol putain fesses
  ivre saoul vodka whisky drogue`,
  de: `arsch fick fickt fotze geil geile hure huren kacke kotze mist neger nutte pisse milf after lesbe porno penis vulva titte
ficke dirne tunte puff popo zicke luder depp busen tussi idiot
bumsen ficken vögeln muschi pimmel nippel pissen pisser kotzen furzen koitus kondom erotik libido vagina voyeur domina inzest
geilen kiffen kiffer koksen kokain heroin psycho prolet lusche penner fatzke dussel zicken zickig fresse schwul pfaffe suizid
tampon saufen säufer schiss pinkel poppen eunuch
  jude arier moslem türken eskimo
  sexy ficken
  droge whisky`,
};

/**
 * English word list for the star-name filter. Lowercase, one word or phrase each. Whole words are matched always;
 * entries of 5 or more letters are also matched inside run-together text ("f.u.c.k", "shitface"). It is a floor,
 * not a wall: the teacher or moderator still approves every name, and a report button sits beside every name.
 * Kept in the repo, no third-party service.
 */
const BLOCKED_EN: readonly string[] = [
  // swearing
  "fuck",
  "fucker",
  "fucking",
  "motherfucker",
  "shit",
  "shitty",
  "bullshit",
  "bitch",
  "bastard",
  "asshole",
  "arsehole",
  "dick",
  "dickhead",
  "cock",
  "cunt",
  "pussy",
  "twat",
  "wanker",
  "prick",
  "slut",
  "whore",
  "hoe",
  "piss",
  "crap",
  "damn",
  "douche",
  "douchebag",
  "bollocks",
  "bugger",
  // sexual
  "sex",
  "sexy",
  "porn",
  "porno",
  "nude",
  "naked",
  "boob",
  "boobs",
  "tits",
  "titty",
  "penis",
  "vagina",
  "anal",
  "blowjob",
  "handjob",
  "cum",
  "orgasm",
  "erotic",
  "horny",
  "dildo",
  "masturbate",
  "rape",
  "rapist",
  "molest",
  "pedo",
  "pedophile",
  "paedophile",
  "incest",
  "hentai",
  "milf",
  "fetish",
  "stripper",
  // hate and slurs
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "dyke",
  "retard",
  "retarded",
  "spic",
  "chink",
  "gook",
  "kike",
  "wetback",
  "tranny",
  "coon",
  "paki",
  "nazi",
  "hitler",
  "heil",
  "kkk",
  "jihad",
  "terrorist",
  "whitepower",
  "isis",
  // violence and self-harm
  "kill",
  "killer",
  "murder",
  "suicide",
  "die",
  "dead",
  "death",
  "bomb",
  "shoot",
  "shooter",
  "stab",
  "gun",
  "terror",
  "genocide",
  "massacre",
  "hang",
  "cutting",
  "selfharm",
  "killyourself",
  "kys",
  // drugs
  "cocaine",
  "heroin",
  "meth",
  "crack",
  "weed",
  "marijuana",
  "lsd",
  "ecstasy",
  "opium",
  // other things a child's star name should not be
  "poop",
  "pee",
  "fart",
  "booger",
  "stupid",
  "idiot",
  "moron",
  "dumb",
  "ugly",
  "fat",
  "loser",
  "hate",
];

/**
 * Japanese word list for the star-name filter. Matched inside the text after it is normalised (full-width to
 * normal width, hiragana to katakana, spaces and marks taken out), because Japanese has no spaces between words.
 * Entries are written in hiragana or katakana where there is a kana spelling, and in kanji where only that is used.
 * Short on purpose: a short entry that is also part of an ordinary word would block good names, so those
 * are left to the teacher's and moderator's approval and the report button.
 */
const BLOCKED_JA: readonly string[] = [
  // swearing and insults
  "ばか",
  "バカ",
  "馬鹿",
  "ばかやろう",
  "バカヤロウ",
  "馬鹿野郎",
  "しねよ",
  "死ねよ",
  "しんでしまえ",
  "死んでしまえ",
  "あほ",
  "アホ",
  "くそ",
  "クソ",
  "糞",
  "しね",
  "シネ",
  "死ね",
  "ころす",
  "殺す",
  "ころせ",
  "殺せ",
  "きもい",
  "キモイ",
  "キモい",
  "うざい",
  "ウザイ",
  "ブス",
  "ぶす",
  "デブ",
  "でぶ",
  "カス",
  "ハゲ",
  "きちがい",
  "キチガイ",
  "気違い",
  "ちんこ",
  "チンコ",
  "ちんぽ",
  "チンポ",
  "まんこ",
  "マンコ",
  "おっぱい",
  "オッパイ",
  // sexual
  "セックス",
  "せっくす",
  "エロ",
  "えろ",
  "ちかん",
  "チカン",
  "痴漢",
  "レイプ",
  "れいぷ",
  "強姦",
  "ポルノ",
  "ぽるの",
  "オナニー",
  "おなにー",
  "ヌード",
  // violence, death, self-harm
  "自殺",
  "じさつ",
  "ジサツ",
  "殺人",
  "さつじん",
  "爆弾",
  "ばくだん",
  "テロ",
  "てろ",
  "虐殺",
  "死にたい",
  "しにたい",
  // hate
  "ナチス",
  "なちす",
  "ヒトラー",
  "ひとらー",
  "チョン",
  "支那",
  "ニガー",
  "ジャップ",
  // drugs
  "覚醒剤",
  "かくせいざい",
  "コカイン",
  "ヘロイン",
  "大麻",
  "たいま",
];

// The readings are rude by themselves, including when an ordinary word has the same spelling.
const VULGAR = ["まんこ", "おまんこ", "うんこ", "おっぱい", "ちんこ", "ちんぽ", "れいぷ"];
/** English words for checking typed text. */
export const en = [...new Set([...WORDS.en.split(/\s+/), ...BLOCKED_EN])];
/** French words for checking typed text. */
export const fr = [...new Set(WORDS.fr.split(/\s+/))];
/** German words for checking typed text. */
export const de = [...new Set(WORDS.de.split(/\s+/))];
/** Japanese words for checking typed text. */
export const ja = [...new Set([...BLOCKED_JA, ...VULGAR])];
