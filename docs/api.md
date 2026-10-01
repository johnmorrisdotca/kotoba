# API reference

Every export of every entry point of `@johnmorrisdotca/kotoba`, with its signature and its doc comment. This file is made from the source by `pnpm docs:api`, and a test fails when it falls behind: 9 entry points, 46 exports.

## `@johnmorrisdotca/kotoba`

[`ALPHABETS`](#main-ALPHABETS) · [`cycleMark`](#main-cycleMark) · [`decodeGuesses`](#main-decodeGuesses) · [`decodeHidden`](#main-decodeHidden) · [`encodeHidden`](#main-encodeHidden) · [`finishRomaji`](#main-finishRomaji) · [`foundBonus`](#main-foundBonus) · [`GomojiLanguage`](#main-GomojiLanguage) · [`isSmall`](#main-isSmall) · [`KANA_COLUMN`](#main-KANA_COLUMN) · [`KANA_SIZES`](#main-KANA_SIZES) · [`kanaBase`](#main-kanaBase) · [`kanaFamily`](#main-kanaFamily) · [`kanaFound`](#main-kanaFound) · [`KanaMark`](#main-KanaMark) · [`KanaMarked`](#main-KanaMarked) · [`kanaScore`](#main-kanaScore) · [`KanaScore`](#main-KanaScore) · [`kanaTone`](#main-kanaTone) · [`KanaWords`](#main-KanaWords) · [`KEYBOARD_ROWS`](#main-KEYBOARD_ROWS) · [`LetterMark`](#main-LetterMark) · [`LONG_BAR`](#main-LONG_BAR) · [`markGuess`](#main-markGuess) · [`markKanaGuess`](#main-markKanaGuess) · [`Packed`](#main-Packed) · [`readRomaji`](#main-readRomaji) · [`readWordLists`](#main-readWordLists) · [`toggleSize`](#main-toggleSize) · [`unpack`](#main-unpack) · [`VERSION`](#main-VERSION) · [`WORD_SCORE`](#main-WORD_SCORE) · [`WordData`](#main-WordData) · [`WordListLanguage`](#main-WordListLanguage) · [`WordLists`](#main-WordLists) · [`wordScore`](#main-wordScore) · [`WordScore`](#main-WordScore)

<a id="main-ALPHABETS"></a>

### const `ALPHABETS`

```ts
ALPHABETS: Readonly<Record<GomojiLanguage, string>>
```

The letters each alphabet game's words are written in, as a character class.

<a id="main-cycleMark"></a>

### function `cycleMark`

```ts
cycleMark(kana: string): string
```

゛゜: a kana's mark, round in turn — は → ば → ぱ → は, か → が → か, う → ゔ → う; a kana with no marked form stays.

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

<a id="main-toggleSize"></a>

### function `toggleSize`

```ts
toggleSize(kana: string): string
```

小: a kana made small, or large again (つ ⇄ っ); one with no small form stays as it is.

<a id="main-unpack"></a>

### function `unpack`

```ts
unpack(packed: Packed, size: number): KanaWords
```

A packed kana list read into its words, `size` kana each.

<a id="main-VERSION"></a>

### const `VERSION`

```ts
VERSION: "1.0.0"
```

The package's version.

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
