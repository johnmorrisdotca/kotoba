# API reference

Every export of every entry point of `@johnmorrisdotca/kotoba`, with its signature and its doc comment. This file is made from the source by `pnpm docs:api`, and a test fails when it falls behind: 12 entry points, 92 exports.

## `@johnmorrisdotca/kotoba`

[`ALPHABETS`](#main-ALPHABETS) · [`changeWordGame`](#main-changeWordGame) · [`cycleMark`](#main-cycleMark) · [`dailyIndex`](#main-dailyIndex) · [`DailyOptions`](#main-DailyOptions) · [`dailyWord`](#main-dailyWord) · [`dayKey`](#main-dayKey) · [`DayKey`](#main-DayKey) · [`dayNumber`](#main-dayNumber) · [`decodeGuesses`](#main-decodeGuesses) · [`decodeHidden`](#main-decodeHidden) · [`encodeHidden`](#main-encodeHidden) · [`eraseWordGame`](#main-eraseWordGame) · [`finishRomaji`](#main-finishRomaji) · [`foundBonus`](#main-foundBonus) · [`GomojiLanguage`](#main-GomojiLanguage) · [`guessMarks`](#main-guessMarks) · [`isDayKey`](#main-isDayKey) · [`isKanaGame`](#main-isKanaGame) · [`isSmall`](#main-isSmall) · [`KANA_COLUMN`](#main-KANA_COLUMN) · [`KANA_SIZES`](#main-KANA_SIZES) · [`kanaBase`](#main-kanaBase) · [`kanaFamily`](#main-kanaFamily) · [`kanaFound`](#main-kanaFound) · [`KanaMark`](#main-KanaMark) · [`KanaMarked`](#main-KanaMarked) · [`kanaScore`](#main-kanaScore) · [`KanaScore`](#main-KanaScore) · [`kanaTone`](#main-kanaTone) · [`KanaWords`](#main-KanaWords) · [`KEYBOARD_ROWS`](#main-KEYBOARD_ROWS) · [`keyMarks`](#main-keyMarks) · [`KOTOBA_STRINGS`](#main-KOTOBA_STRINGS) · [`kotobaLanguage`](#main-kotobaLanguage) · [`kotobaSay`](#main-kotobaSay) · [`KotobaStrings`](#main-KotobaStrings) · [`Language`](#main-Language) · [`LetterMark`](#main-LetterMark) · [`LONG_BAR`](#main-LONG_BAR) · [`markGuess`](#main-markGuess) · [`markKanaGuess`](#main-markKanaGuess) · [`Packed`](#main-Packed) · [`PlaceMark`](#main-PlaceMark) · [`readRomaji`](#main-readRomaji) · [`readWordLists`](#main-readWordLists) · [`startWordGame`](#main-startWordGame) · [`submitWordGame`](#main-submitWordGame) · [`toggleSize`](#main-toggleSize) · [`typeWordGame`](#main-typeWordGame) · [`unpack`](#main-unpack) · [`VERSION`](#main-VERSION) · [`WORD_GAME_ROWS`](#main-WORD_GAME_ROWS) · [`WORD_SCORE`](#main-WORD_SCORE) · [`WordData`](#main-WordData) · [`WordGame`](#main-WordGame) · [`wordGameKeys`](#main-wordGameKeys) · [`WordGameLanguage`](#main-WordGameLanguage) · [`WordGameRefusal`](#main-WordGameRefusal) · [`WordGameStatus`](#main-WordGameStatus) · [`WordGameSubmit`](#main-WordGameSubmit) · [`WordGameWords`](#main-WordGameWords) · [`WordListLanguage`](#main-WordListLanguage) · [`WordLists`](#main-WordLists) · [`wordScore`](#main-wordScore) · [`WordScore`](#main-WordScore)

<a id="main-ALPHABETS"></a>

### const `ALPHABETS`

```ts
ALPHABETS: Readonly<Record<GomojiLanguage, string>>
```

The letters each alphabet game's words are written in, as a character class.

<a id="main-changeWordGame"></a>

### function `changeWordGame`

```ts
changeWordGame(game: WordGame, change: "size" | "mark"): WordGame
```

The last kana typed made small or large again (つ and っ), or given the next mark (は, ば, ぱ). Letters have neither: nothing changes.

<a id="main-cycleMark"></a>

### function `cycleMark`

```ts
cycleMark(kana: string): string
```

゛゜: a kana's mark, round in turn — は → ば → ぱ → は, か → が → か, う → ゔ → う; a kana with no marked form stays.

<a id="main-dailyIndex"></a>

### function `dailyIndex`

```ts
dailyIndex(count: number, day: DayKey, salt?: string): number
```

Which of `count` words a day gets, from 0 to `count - 1`. Over any run of
`count` days that starts at a multiple of `count` days after 1970-01-01,
every place comes up exactly once. `salt` names the list, so that two lists
of one length are not dealt in the same order.

<a id="main-DailyOptions"></a>

### type `DailyOptions`

```ts
type DailyOptions = { /** Names the list, so that two lists of one length are dealt in different orders. Unless said, empty. */ salt?: string; /** An IANA time zone, for a moment given as a `Date`: the word turns over at that place's midnight. Unless said, UTC. */ zone?: string; };
```

How a day's word is chosen.

<a id="main-dailyWord"></a>

### function `dailyWord`

```ts
dailyWord(words: readonly string[], day?: DayKey | Date | number, options?: DailyOptions): string
```

The word of a day: the same for everybody who asks about the same day of the
same list. Give a `YYYY-MM-DD` day, or a `Date` (read as a day in UTC, or in
`zone`). Throws a `RangeError` for an empty list or a day that is not one.

<a id="main-dayKey"></a>

### function `dayKey`

```ts
dayKey(moment?: Date | number, zone?: string): DayKey
```

The calendar day a moment falls on, as `YYYY-MM-DD`: in UTC unless an IANA
time zone such as `Asia/Tokyo` is named. A name is passed on to `Intl`, which
throws a `RangeError` for a zone it does not know.

<a id="main-DayKey"></a>

### type `DayKey`

```ts
type DayKey = string;
```

A day's name: four digits of year, two of month and two of day, such as `2026-10-01`.

<a id="main-dayNumber"></a>

### function `dayNumber`

```ts
dayNumber(day: DayKey): number
```

How many days after 1970-01-01 a day is, counting the calendar and nothing else: a day has no hours here.

<a id="main-decodeGuesses"></a>

### function `decodeGuesses`

```ts
decodeGuesses(code: string, size: number, lang?: GomojiLanguage): string[] | null
```

Guesses run together, `size` letters each, read back as a list; null for anything else.

<a id="main-decodeHidden"></a>

### function `decodeHidden`

```ts
decodeHidden(givens: string, size: number, lang?: GomojiLanguage): string | null
```

A hidden word read back, in lower case, or null for one that is not `size` letters of the language's alphabet.

<a id="main-encodeHidden"></a>

### function `encodeHidden`

```ts
encodeHidden(word: string): string
```

A hidden word as it is written down for a puzzle: in capitals.

<a id="main-eraseWordGame"></a>

### function `eraseWordGame`

```ts
eraseWordGame(game: WordGame): WordGame
```

The last thing typed taken back: romaji not yet a kana first, then the last kana or letter.

<a id="main-finishRomaji"></a>

### function `finishRomaji`

```ts
finishRomaji(typed: string): string[]
```

At Enter: what was typed, with a last "n" read as ん and any other unfinished sound dropped.

<a id="main-foundBonus"></a>

### function `foundBonus`

```ts
foundBonus(size: number, rows: number): number
```

Finding the word: 10 for every place of every guess the board gives, so it grows with the board.

<a id="main-GomojiLanguage"></a>

### type `GomojiLanguage`

```ts
type GomojiLanguage = "en" | "fr" | "de" | "pop";
```

The alphabet games: English, French, German, and the pop-culture English list.

<a id="main-guessMarks"></a>

### function `guessMarks`

```ts
guessMarks(game: Pick<WordGame, "language" | "hidden">, guess: string): PlaceMark[]
```

How each place of a guess did against the hidden word. For letters `wrongSize` and `wrongMark` are false.

<a id="main-isDayKey"></a>

### function `isDayKey`

```ts
isDayKey(text: unknown): text is DayKey
```

Whether the text is a real calendar date written `YYYY-MM-DD`, from the year 0000 to 9999.

<a id="main-isKanaGame"></a>

### function `isKanaGame`

```ts
isKanaGame: (game: Pick<WordGame, "language">) => boolean
```

Whether a round is played in kana.

<a id="main-isSmall"></a>

### function `isSmall`

```ts
isSmall(kana: string): boolean
```

<a id="main-KANA_COLUMN"></a>

### const `KANA_COLUMN`

```ts
KANA_COLUMN: 1
```

WHAT A KANA WORD SCORES, won or lost, on English's scale (`wordScore`) so
the two boards read alike. A guess's weight is the rows still to come.

 - PLACED: a place first played plain green, 10 × that guess's weight.
 - ELSEWHERE: a kana of the word never placed but found another way — orange,
   or green with an arrow — 4 × the weight of the guess that first showed it.
 - COLUMN: a place never found either way whose column a yellow once named,
   1 × that guess's weight: it says which column, not which kana.
 - FOUND and SPEED: as English — the word 10 a place for every guess the
   board gives (`foundBonus`) and 25 a guess left, and up to 50 for a word
   found inside a minute.

A lost word never had every place plain green in one guess, so it comes to
at most 10 × (kana × guesses − 1), and a word found on its last row to more
than that (`kanaScore.test.ts`, at every size and count of guesses). Only a
word with no kana and no column found scores 0.

<a id="main-KANA_SIZES"></a>

### const `KANA_SIZES`

```ts
KANA_SIZES: readonly [3, 4, 5]
```

The lengths the kana lists come in.

<a id="main-kanaBase"></a>

### function `kanaBase`

```ts
kanaBase(kana: string): string
```

A kana without its size or its mark: ぱ → は, っ → つ, ゔ → う. ー and anything unknown are themselves.

<a id="main-kanaFamily"></a>

### function `kanaFamily`

```ts
kanaFamily(kana: string): number | null
```

The gojūon row a kana belongs to, by its base, or null for ー and anything that is no kana.

<a id="main-kanaFound"></a>

### function `kanaFound`

```ts
kanaFound(guess: readonly string[], word: readonly string[]): boolean
```

Found: every place plain green — the right kana, the right size, the right mark.

<a id="main-KanaMark"></a>

### type `KanaMark`

```ts
type KanaMark = "hit" | "near" | "kin" | "miss";
```

HOW A KANA GUESS IS COLOURED, by John's rules for Gomoji in kana
(2026-09-25; the table is in docs/plans/other/WORD-04-kana.md):

 - green: the same kana in this place;
 - green with an arrow: the same kana in this place but the wrong size (↓,
   っ for つ) or the wrong mark (↑, ば for は) — not found until plain green;
 - orange: the kana is in the word elsewhere, an arrow likewise when its size
   or mark differs;
 - yellow: the word's kana in this place is not this one but is of its
   family, the same consonant row of the gojūon (か行, and が with it);
 - grey: none of those.

ー is a character with no family, size or mark: green, orange or grey only.
A kana is counted as often as the word holds it, as the English marking is:
green first, then orange from left to right from what green left over.

<a id="main-KanaMarked"></a>

### type `KanaMarked`

```ts
type KanaMarked = { mark: KanaMark; wrongSize: boolean; wrongMark: boolean };
```

<a id="main-kanaScore"></a>

### function `kanaScore`

```ts
kanaScore(word: string, guesses: readonly string[], rows: number, elapsedMs: number): KanaScore
```

<a id="main-KanaScore"></a>

### type `KanaScore`

```ts
type KanaScore = WordScore & { column: number };
```

<a id="main-kanaTone"></a>

### function `kanaTone`

```ts
kanaTone(kana: string): "" | "\u309B" | "\u309C"
```

Which mark a kana carries: none, ゛ or ゜.

<a id="main-KanaWords"></a>

### type `KanaWords`

```ts
type KanaWords = { /** The JMdict release the list was made from, for the credit on the page. */ release: string; easy: readonly string[]; answers: readonly string[]; allowed: ReadonlySet<string>; };
```

A kana list, read.

<a id="main-KEYBOARD_ROWS"></a>

### const `KEYBOARD_ROWS`

```ts
KEYBOARD_ROWS: Record<GomojiLanguage, readonly string[]>
```

THE PHYSICAL KEYBOARD DRAWN UNDER A GOMOJI GRID, by language: QWERTY for
English, AZERTY for French (the same 26 plain letters English's keys carry,
arranged the way a French keyboard is), and QWERTZ for German, with Ä, Ö and
Ü carried as keys of their own — German's letters, not English's plus a
fold. All three are three rows, so `WordKeyboard`'s Enter and Backspace,
fixed to the last row, sit right whichever is drawn.

<a id="main-keyMarks"></a>

### function `keyMarks`

```ts
keyMarks(game: WordGame): Map<string, LetterMark>
```

The best mark each letter has earned across the guesses, for colouring a
keyboard: a hit beats near beats miss. Kana have no such keyboard, so a kana
round answers with nothing.

<a id="main-KOTOBA_STRINGS"></a>

### const `KOTOBA_STRINGS`

```ts
KOTOBA_STRINGS: Record<Language, KotobaStrings>
```

Every string, in both languages. The Japanese has not yet been read by a native reader.

<a id="main-kotobaLanguage"></a>

### function `kotobaLanguage`

```ts
kotobaLanguage(tag: string | undefined): Language
```

The language a person asked for, by `en` or `ja` or a tag that begins with one: English for anything else.

<a id="main-kotobaSay"></a>

### function `kotobaSay`

```ts
kotobaSay(text: string, values?: Readonly<Record<string, string | number>>): string
```

A string with its braces filled in from `values`; a brace with no value is left as it is.

<a id="main-KotobaStrings"></a>

### type `KotobaStrings`

```ts
type KotobaStrings = { /** The lists, by their names for themselves. */ listEn: string; listFr: string; listDe: string; listJa: string; letters: string; kana: string; /** The game's words. */ loading: string; ready: string; readyKana: string; notWord: string; tooShort: string; won: string; lost: string; enter: string; back: string; small: string; mark: string; legendLetters: string; legendKana: string; markHit: stri…
```

The names of the strings. Each is one line or one block of text.

<a id="main-Language"></a>

### type `Language`

```ts
type Language = "en" | "ja";
```

The languages Kotoba speaks. This is the language of its words, not of the word lists: a list in French is played with English words or Japanese ones.

<a id="main-LetterMark"></a>

### type `LetterMark`

```ts
type LetterMark = "hit" | "near" | "miss";
```

How a guessed letter did: in its place, in the word elsewhere, or not in it.

<a id="main-LONG_BAR"></a>

### const `LONG_BAR`

```ts
LONG_BAR: "ー"
```

The long-vowel bar, a character of its own.

<a id="main-markGuess"></a>

### function `markGuess`

```ts
markGuess(guess: string, hidden: string): LetterMark[]
```

Each letter of a guess marked against the hidden word, counting a letter only as often as the word holds it.

<a id="main-markKanaGuess"></a>

### function `markKanaGuess`

```ts
markKanaGuess(guess: readonly string[], word: readonly string[]): KanaMarked[]
```

A guess coloured against the word, place by place. Both are arrays of single kana.

<a id="main-Packed"></a>

### type `Packed`

```ts
type Packed = { release: string; alphabet: string; codes: string; easy: string; answers: string; allowed: string };
```

A kana list as its entry point exports it: the JMdict release, an alphabet of kana and one character a kana for each, and the three lists written in those characters.

<a id="main-PlaceMark"></a>

### type `PlaceMark`

```ts
type PlaceMark = { mark: LetterMark | "kin"; wrongSize: boolean; wrongMark: boolean };
```

One place of a marked guess: how it did, and for kana whether its size or mark is wrong.

<a id="main-readRomaji"></a>

### function `readRomaji`

```ts
readRomaji(typed: string): { kana: string[]; rest: string; }
```

What has been typed, as kana, and what is still being typed.

<a id="main-readWordLists"></a>

### function `readWordLists`

```ts
readWordLists(data: WordData, size: number): WordLists | null
```

One length of a list read into words, or null for a length the list does not have.

<a id="main-startWordGame"></a>

### function `startWordGame`

```ts
startWordGame(language: WordGameLanguage, size: number, hidden: string, rows?: number): WordGame
```

A new round: nothing guessed, nothing typed. The hidden word is as the list gives it (lower case letters, or kana).

<a id="main-submitWordGame"></a>

### function `submitWordGame`

```ts
submitWordGame(game: WordGame, words: WordGameWords, now?: number): WordGameSubmit
```

The guess being typed sent in, `now` being the time in milliseconds. Kana
still waiting as romaji are finished first (`finishRomaji`). A guess that is
too short, or not in the list, is not taken: the round comes back with what
was typed kept, and says why. A guess that is taken ends the round when it is
the hidden word or the last guess, and the round is then scored.

<a id="main-toggleSize"></a>

### function `toggleSize`

```ts
toggleSize(kana: string): string
```

小: a kana made small, or large again (つ ⇄ っ); one with no small form stays as it is.

<a id="main-typeWordGame"></a>

### function `typeWordGame`

```ts
typeWordGame(game: WordGame, key: string, now?: number): WordGame
```

One key typed, `now` being the time in milliseconds (the first key starts the clock). A key the round does not take, or a round that is over, changes nothing.

<a id="main-unpack"></a>

### function `unpack`

```ts
unpack(packed: Packed, size: number): KanaWords
```

A packed kana list read into its words, `size` kana each.

<a id="main-VERSION"></a>

### const `VERSION`

```ts
VERSION: "1.1.2"
```

The package's version.

<a id="main-WORD_GAME_ROWS"></a>

### const `WORD_GAME_ROWS`

```ts
WORD_GAME_ROWS: 6
```

The guesses a round gives unless said.

<a id="main-WORD_SCORE"></a>

### const `WORD_SCORE`

```ts
WORD_SCORE: { readonly placed: 10; readonly elsewhere: 4; readonly rowLeft: 25; readonly speedMost: 50; readonly speedFreeMs: 60000; readonly speedStepMs: 6000; }
```

WHAT A GOMOJI WORD SCORES, won or lost. John, 2026-09-25: "lost words
would give you more than 0 for getting some GREEN and some yellow. like time
gives you some points, number of guesses, number of green, sooner the better
green, yellows, number of yellows, etc." and "0 points is only possible for
never hitting even one letter".

Every letter of the word is worth something the first time it is found, and
more the sooner: a guess's WEIGHT is the rows that were still to come when
it was made, so the first row of six weighs 6 and the last weighs 1.

 - PLACED: a letter in its place, 10 × the weight of the guess that first
   put it there.
 - ELSEWHERE: a letter of the word found but never placed, 4 × the weight of
   the guess that first showed it.
 - FOUND: the word itself, 10 for every place of every guess the board
   gives (`foundBonus`: 300 for five letters and six guesses, 450 for nine),
   and 25 for every guess left unused.
 - SPEED: a word found inside a minute, 50, one fewer for every six seconds
   after that, nothing after six minutes. The browser's clock, as every solo
   time here is; a lost word earns none, or giving up fast would pay.

So a word with no letter ever found scores 0 and nothing else does, and any
word found is worth more than any word lost, however many guesses the level
gives (`layout.ts`). A lost word never had every letter in place in one
guess, so at best all but one went in on the first row and the last on the
second: 10 × (letters × guesses − 1). A word found on its last row has every
place (10 × letters) and the bonus (10 × letters × guesses), which is more
(`wordScore.test.ts` holds it at every size and level). Everything but the time is read from the
guesses, which the server has checked, so the server works it out itself.

<a id="main-WordData"></a>

### type `WordData`

```ts
type WordData = Record<number, { easy: string; answers: string; allowed: string }>;
```

An alphabet list as its entry point exports it: for each length, the easy answers, all the answers and every word that may be guessed, each a run of words between spaces.

<a id="main-WordGame"></a>

### type `WordGame`

```ts
type WordGame = { language: WordGameLanguage; /** How many letters, or kana, the word has. */ size: number; /** How many guesses the round gives. */ rows: number; /** The word to find. */ hidden: string; /** The guesses made, each a whole word. */ guesses: readonly string[]; /** The letters, or kana, of the guess being typed. */ typed: readonly string[]; /** Romaji typed and not yet a kana: `k` waiting for a vowel. …
```

A round.

<a id="main-wordGameKeys"></a>

### function `wordGameKeys`

```ts
wordGameKeys(language: WordGameLanguage): string
```

The keys a round accepts, by the character each types: the letters of the language's keyboard, and for kana the letters of romaji and the long-vowel bar.

<a id="main-WordGameLanguage"></a>

### type `WordGameLanguage`

```ts
type WordGameLanguage = GomojiLanguage | "ja";
```

The languages a round is played in: the alphabet ones and Japanese kana.

<a id="main-WordGameRefusal"></a>

### type `WordGameRefusal`

```ts
type WordGameRefusal = "too-short" | "not-a-word";
```

Why a guess was not taken: it was too short, or the list does not have the word.

<a id="main-WordGameStatus"></a>

### type `WordGameStatus`

```ts
type WordGameStatus = "playing" | "won" | "lost";
```

How a round stands: still being played, found, or out of guesses.

<a id="main-WordGameSubmit"></a>

### type `WordGameSubmit`

```ts
type WordGameSubmit = { game: WordGame; refused: WordGameRefusal | null };
```

A guess sent in: the round after it, and why the guess was not taken, if it was not.

<a id="main-WordGameWords"></a>

### type `WordGameWords`

```ts
type WordGameWords = { allowed: ReadonlySet<string>; answers?: readonly string[] };
```

The words a round may be guessed from. `answers` is checked as well as `allowed`, for a list whose answers may not all be in `allowed`.

<a id="main-WordListLanguage"></a>

### type `WordListLanguage`

```ts
type WordListLanguage = "en" | "fr" | "de";
```

The languages with a dictionary of their own: English, French and German.

<a id="main-WordLists"></a>

### type `WordLists`

```ts
type WordLists = { easy: readonly string[]; answers: readonly string[]; allowed: ReadonlySet<string> };
```

One length of an alphabet list, read: the easy answers, every answer, and the words that may be guessed.

<a id="main-wordScore"></a>

### function `wordScore`

```ts
wordScore(hidden: string, guesses: readonly string[], rows: number, elapsedMs: number): WordScore
```

`rows` is how many guesses the puzzle gives (`guessesFor`), which sets every weight.

<a id="main-WordScore"></a>

### type `WordScore`

```ts
type WordScore = { placed: number; elsewhere: number; found: number; speed: number; total: number };
```

## `@johnmorrisdotca/kotoba/words-en`

[`EN_WORDS`](#words-en-EN_WORDS)

<a id="words-en-EN_WORDS"></a>

### const `EN_WORDS`

```ts
EN_WORDS: Record<number, { easy: string; answers: string; allowed: string; }>
```

THE ENGLISH WORDS FOR GOMOJI. Written by `scripts/word-lists.mjs` from
SCOWL 2020.12.07 (http://wordlist.aspell.net/), read 2026-09-25: answers from
sizes 10–35 (easy: 10–20), guesses from sizes 10–70, English and American
spellings. Never edited by hand; run the script again instead.

SCOWL's notice, which its licence asks to travel with the lists:

The collective work is Copyright 2000-2018 by Kevin Atkinson as well
as any of the copyrights mentioned below:

  Copyright 2000-2018 by Kevin Atkinson

  Permission to use, copy, modify, distribute and sell these word
  lists, the associated scripts, the output created from the scripts,
  and its documentation for any purpose is hereby granted without fee,
  provided that the above copyright notice appears in all copies and
  that both that copyright notice and this permission notice appear in
  supporting documentation. Kevin Atkinson makes no representations
  about the suitability of this array for any purpose. It is provided
  "as is" without express or implied warranty.

## `@johnmorrisdotca/kotoba/words-fr`

[`FR_WORDS`](#words-fr-FR_WORDS)

<a id="words-fr-FR_WORDS"></a>

### const `FR_WORDS`

```ts
FR_WORDS: Record<number, { easy: string; answers: string; allowed: string; }>
```

THE FRENCH WORDS FOR GOMOJI. Written by `scripts/word-lists-fr-de.mjs`, read 2026-09-26, from
Lexique 3.83 (http://www.lexique.org), which decides what is a word; ranked by
hermitdave's FrequencyWords (OpenSubtitles 2018, https://github.com/hermitdave/FrequencyWords,
content/2018/fr/fr_50k.txt; word frequency lists compiled by Hermit Dave from
https://opensubtitles.org), with Lexique's own count ranking the answers; and
Wiktionary (via https://kaikki.org), which an answer must also be in, and which
says where a word English also spells came from. All under CC BY-SA 4.0
(https://creativecommons.org/licenses/by-sa/4.0/), and this list with them.
Never edited by hand; run the script again instead.

Every word the dictionary has may be guessed. An answer is also in
Wiktionary, a base form, a word of this language rather than one borrowed
from English, and not vulgar or a slur (the script says how).
Accents are folded to their plain letter (é→E, ç→C…); a word with œ or æ has no plain spelling and is left out.

## `@johnmorrisdotca/kotoba/words-de`

[`DE_WORDS`](#words-de-DE_WORDS)

<a id="words-de-DE_WORDS"></a>

### const `DE_WORDS`

```ts
DE_WORDS: Record<number, { easy: string; answers: string; allowed: string; }>
```

THE GERMAN WORDS FOR GOMOJI. Written by `scripts/word-lists-fr-de.mjs`, read 2026-09-26, from
LanguageTool's german-pos-dict (Morphy and korrekturen.de,
https://github.com/languagetool-org/german-pos-dict), which decides what is a
word; ranked by hermitdave's FrequencyWords (OpenSubtitles 2018,
https://github.com/hermitdave/FrequencyWords, content/2018/de/de_50k.txt; word
frequency lists compiled by Hermit Dave from https://opensubtitles.org); and
Wiktionary (via https://kaikki.org), which an answer must also be in, and which
says where a word English also spells came from. All under CC BY-SA 4.0
(https://creativecommons.org/licenses/by-sa/4.0/), and this list with them.
Never edited by hand; run the script again instead.

Every word the dictionary has may be guessed. An answer is also in
Wiktionary, a base form, a word of this language rather than one borrowed
from English, and not vulgar or a slur (the script says how).
Ä, Ö and Ü are kept as letters of their own; a word with ß is left out, the way French leaves out œ and æ.

## `@johnmorrisdotca/kotoba/pop-answers`

[`POP_ANSWERS`](#pop-answers-POP_ANSWERS) · [`POP_CATEGORIES`](#pop-answers-POP_CATEGORIES)

<a id="pop-answers-POP_ANSWERS"></a>

### const `POP_ANSWERS`

```ts
POP_ANSWERS: Record<number, string>
```

<a id="pop-answers-POP_CATEGORIES"></a>

### const `POP_CATEGORIES`

```ts
POP_CATEGORIES: readonly string[]
```

POP GOMOJI'S ANSWERS. Written by `scripts/word-lists-pop.mjs` from the
hand-kept `scripts/pop-corpus.txt`; never edited by hand. Each word is
written `word.n`, n being its category's place in `POP_CATEGORIES`: the
clue the puzzle shows.

## `@johnmorrisdotca/kotoba/pop-guesses`

[`POP_GUESSES`](#pop-guesses-POP_GUESSES)

<a id="pop-guesses-POP_GUESSES"></a>

### const `POP_GUESSES`

```ts
POP_GUESSES: Record<number, string>
```

POP GOMOJI'S DICTIONARY GUESSES AT THREE AND SEVEN LETTERS, the lengths
Gomoji's English lists do not have. Written by `scripts/word-lists-pop.mjs`
from SCOWL 2020.12.07 (http://wordlist.aspell.net/), read 2026-09-26: sizes
10–70, English and American spellings, as `words.en.data.ts` is. Fetched
only when a three- or seven-letter Pop Gomoji is played (`loadPopGuesses`).
Never edited by hand; run the script again instead.

SCOWL's notice, which its licence asks to travel with the lists:

The collective work is Copyright 2000-2018 by Kevin Atkinson as well
as any of the copyrights mentioned below:

  Copyright 2000-2018 by Kevin Atkinson

  Permission to use, copy, modify, distribute and sell these word
  lists, the associated scripts, the output created from the scripts,
  and its documentation for any purpose is hereby granted without fee,
  provided that the above copyright notice appears in all copies and
  that both that copyright notice and this permission notice appear in
  supporting documentation. Kevin Atkinson makes no representations
  about the suitability of this array for any purpose. It is provided
  "as is" without express or implied warranty.

## `@johnmorrisdotca/kotoba/kana-3`

[`JA_WORDS_3`](#kana-3-JA_WORDS_3)

<a id="kana-3-JA_WORDS_3"></a>

### const `JA_WORDS_3`

```ts
JA_WORDS_3: { release: string; alphabet: string; codes: string; easy: string; answers: string; allowed: string; }
```

THE 3-KANA WORDS FOR GOMOJI. Written by `scripts/word-lists-ja.mjs` from
JMdict, release 2026-09-28. Never edited by hand; the monthly refresh
(.github/workflows/jmdict-refresh.yml) runs the script again.

JMdict is the property of the Electronic Dictionary Research and Development
Group (EDRDG), used under the Creative Commons Attribution-ShareAlike 4.0
licence and the Group's conditions: https://www.edrdg.org/edrdg/licence.html.
This list is derived from it and is under the same licence.

900 easy answers, 2000 answers at medium and hard, 16444 words that may be guessed.
Each word is written one character a kana through `alphabet` and `codes`,
the words run together with nothing between them (`kanaWords.ts` reads them).

## `@johnmorrisdotca/kotoba/kana-4`

[`JA_WORDS_4`](#kana-4-JA_WORDS_4)

<a id="kana-4-JA_WORDS_4"></a>

### const `JA_WORDS_4`

```ts
JA_WORDS_4: { release: string; alphabet: string; codes: string; easy: string; answers: string; allowed: string; }
```

THE 4-KANA WORDS FOR GOMOJI. Written by `scripts/word-lists-ja.mjs` from
JMdict, release 2026-09-28. Never edited by hand; the monthly refresh
(.github/workflows/jmdict-refresh.yml) runs the script again.

JMdict is the property of the Electronic Dictionary Research and Development
Group (EDRDG), used under the Creative Commons Attribution-ShareAlike 4.0
licence and the Group's conditions: https://www.edrdg.org/edrdg/licence.html.
This list is derived from it and is under the same licence.

900 easy answers, 2000 answers at medium and hard, 39046 words that may be guessed.
Each word is written one character a kana through `alphabet` and `codes`,
the words run together with nothing between them (`kanaWords.ts` reads them).

## `@johnmorrisdotca/kotoba/kana-5`

[`JA_WORDS_5`](#kana-5-JA_WORDS_5)

<a id="kana-5-JA_WORDS_5"></a>

### const `JA_WORDS_5`

```ts
JA_WORDS_5: { release: string; alphabet: string; codes: string; easy: string; answers: string; allowed: string; }
```

THE 5-KANA WORDS FOR GOMOJI. Written by `scripts/word-lists-ja.mjs` from
JMdict, release 2026-09-28. Never edited by hand; the monthly refresh
(.github/workflows/jmdict-refresh.yml) runs the script again.

JMdict is the property of the Electronic Dictionary Research and Development
Group (EDRDG), used under the Creative Commons Attribution-ShareAlike 4.0
licence and the Group's conditions: https://www.edrdg.org/edrdg/licence.html.
This list is derived from it and is under the same licence.

900 easy answers, 2000 answers at medium and hard, 35419 words that may be guessed.
Each word is written one character a kana through `alphabet` and `codes`,
the words run together with nothing between them (`kanaWords.ts` reads them).

## `@johnmorrisdotca/kotoba/cli`

[`cliLanguage`](#cli-cliLanguage) · [`CliResult`](#cli-CliResult) · [`CliSurroundings`](#cli-CliSurroundings) · [`CliTier`](#cli-CliTier) · [`CliWords`](#cli-CliWords) · [`runCli`](#cli-runCli)

<a id="cli-cliLanguage"></a>

### function `cliLanguage`

```ts
cliLanguage(flag: string | undefined, env?: Record<string, string | undefined>, locale?: string): Language
```

The language the command line speaks: `--lang`, or the environment's, or the system's; Japanese for `ja…`, English for anything else.

<a id="cli-CliResult"></a>

### type `CliResult`

```ts
type CliResult = { /** 0 when all went well, 1 when what was asked for is not so or could not be done, 2 when the command itself was wrong. */ code: 0 | 1 | 2; /** For standard output. */ out: string; /** For standard error. */ err: string; };
```

What the command line came to.

<a id="cli-CliSurroundings"></a>

### type `CliSurroundings`

```ts
type CliSurroundings = { /** The environment, for the language: `LC_ALL`, `LC_MESSAGES` and `LANG`. */ env?: Record<string, string | undefined>; /** The system's language where the environment names none: what `Intl` says, on Windows. */ locale?: string; /** The time, in epoch milliseconds, for `daily` with no `--date`. Now, unless given. */ now?: number; };
```

What the command line is run in. All of it is optional.

<a id="cli-CliTier"></a>

### type `CliTier`

```ts
type CliTier = "easy" | "answers" | "allowed";
```

Which words of a list: the easy answers, every answer, or every word that may be guessed.

<a id="cli-CliWords"></a>

### type `CliWords`

```ts
type CliWords = WordListName;
```

The lists the command line reads: the alphabet languages and Japanese kana.

<a id="cli-runCli"></a>

### function `runCli`

```ts
runCli(args: readonly string[], around?: CliSurroundings): Promise<CliResult>
```

Run the command line. See `kotoba --help` for what it takes.

## `@johnmorrisdotca/kotoba/load`

[`LoadedWordList`](#load-LoadedWordList) · [`loadWordList`](#load-loadWordList) · [`WORD_LIST_NAMES`](#load-WORD_LIST_NAMES) · [`WORD_LIST_SIZES`](#load-WORD_LIST_SIZES) · [`WordListName`](#load-WordListName)

<a id="load-LoadedWordList"></a>

### type `LoadedWordList`

```ts
type LoadedWordList = { easy: readonly string[]; answers: readonly string[]; allowed: ReadonlySet<string>; release?: string };
```

A list read into words: the easy answers inside the answers inside the words that may be guessed. A kana list also says which JMdict release it was made from.

<a id="load-loadWordList"></a>

### function `loadWordList`

```ts
loadWordList(name: WordListName, size: number): Promise<LoadedWordList | null>
```

One list of one size read into words, or null for a size the language has no list of.

<a id="load-WORD_LIST_NAMES"></a>

### const `WORD_LIST_NAMES`

```ts
WORD_LIST_NAMES: readonly WordListName[]
```

The lists, in the order they are named.

<a id="load-WORD_LIST_SIZES"></a>

### const `WORD_LIST_SIZES`

```ts
WORD_LIST_SIZES: Readonly<Record<WordListName, readonly number[]>>
```

The sizes each list comes in: four to six letters, or three to five kana.

<a id="load-WordListName"></a>

### type `WordListName`

```ts
type WordListName = "en" | "fr" | "de" | "ja";
```

The languages that have a list to load: English, French, German, and Japanese kana.

## `@johnmorrisdotca/kotoba/play`

[`KOTOBA_PLAY_CSS`](#play-KOTOBA_PLAY_CSS) · [`KOTOBA_PLAY_VARIABLES`](#play-KOTOBA_PLAY_VARIABLES) · [`KotobaNewGame`](#play-KotobaNewGame) · [`KotobaPlay`](#play-KotobaPlay) · [`KotobaPlayOptions`](#play-KotobaPlayOptions) · [`mountKotoba`](#play-mountKotoba)

<a id="play-KOTOBA_PLAY_CSS"></a>

### const `KOTOBA_PLAY_CSS`

```ts
KOTOBA_PLAY_CSS: string
```

The game's stylesheet: added to the page once, as a `<style>` with the id `kotoba-play-style`.

<a id="play-KOTOBA_PLAY_VARIABLES"></a>

### const `KOTOBA_PLAY_VARIABLES`

```ts
KOTOBA_PLAY_VARIABLES: { readonly "--kt-board": "#2f5d4a"; readonly "--kt-ink": "#f3efe4"; readonly "--kt-cell": "#fbf8ee"; readonly "--kt-cell-ink": "#1b1b1b"; readonly "--kt-hit": "#2f7a4f"; readonly "--kt-near": "#d9822b"; readonly "--kt-kin": "#d9b83b"; readonly "--kt-miss": "#5a5f5a"; readonly "--kt-typed": "#e0b43b"; readonly "--kt-radius": "14px"; readonly "--kt-cell-size": "60px"; }
```

The variables the game's look is made of, with what they are unless set. The stylesheet the game adds to a page is `KOTOBA_PLAY_CSS`.

<a id="play-KotobaNewGame"></a>

### type `KotobaNewGame`

```ts
type KotobaNewGame = Pick<KotobaPlayOptions, "words" | "size" | "easy" | "rows" | "seed" | "daily" | "hidden">;
```

What `newGame` may change: the choices about the word, and nothing about the look.

<a id="play-KotobaPlay"></a>

### type `KotobaPlay`

```ts
type KotobaPlay = { /** The round being played, or null while a list is loading. */ readonly game: WordGame | null; /** Settles once the first round is dealt (or the list could not be had). */ readonly ready: Promise<void>; /** Deal a new round, changing the choices given and keeping the rest. Settles once it is dealt. */ newGame(next?: KotobaNewGame): Promise<void>; /** Change the language of the game's own words, …
```

A mounted game.

<a id="play-KotobaPlayOptions"></a>

### type `KotobaPlayOptions`

```ts
type KotobaPlayOptions = { /** The list: English, French, German or Japanese kana. Unless said, English. */ words?: WordListName; /** Letters, or kana, in the word. Unless said, five, or four kana. */ size?: number; /** Hide only one of the easy answers. Unless said, any answer. */ easy?: boolean; /** How many guesses the round gives. Unless said, six. */ rows?: number; /** A seed: the same seed picks the same word …
```

What a round is dealt from, and how the game looks and behaves. Every field may be left out.

<a id="play-mountKotoba"></a>

### function `mountKotoba`

```ts
mountKotoba(container: HTMLElement, options?: KotobaPlayOptions): KotobaPlay
```

Put a word game into `container`, and deal the first round.
