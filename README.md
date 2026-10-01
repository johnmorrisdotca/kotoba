<h1 align="center">Kotoba <sub>言葉</sub></h1>

<p align="center"><strong>Word lists and word-game rules for JavaScript and TypeScript.</strong><br>
English, French, German and Japanese (kana) dictionaries for five-letter and other word games, each list its own import so a page loads only what it plays; with guess marking, scoring, kana marks, romaji input and keyboard rows. No dependencies.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/kotoba/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/kotoba/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/kotoba"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/kotoba?color=2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/kotoba/"><strong>Play a word game →</strong></a> · <a href="https://johnmorrisdotca.github.io/kotoba/api.html">API reference</a></p>

## In 30 seconds

```sh
npm install @johnmorrisdotca/kotoba
```

```ts
import { markGuess, readWordLists } from "@johnmorrisdotca/kotoba";

// Load only the list you play: each list is an entry point of its own.
const { EN_WORDS } = await import("@johnmorrisdotca/kotoba/words-en");
const five = readWordLists(EN_WORDS, 5)!;

five.allowed.has("crane");          // true: a word that may be guessed
five.answers.length;                // the words that may be hidden
markGuess("crane", "react");        // ["near", "near", "hit", "miss", "near"]
```

## Who it is for

- **Word-game makers**: a five-letter game in English, French, German or
  Japanese, with lists already cleaned of names, brands, slurs and subtitle
  noise, and the marking rule every such game shares.
- **Anyone needing a sound list of common words** by length, with an easy tier
  inside the answers inside the words that may be guessed.

## The lists

Each list is its own entry point, so a bundler splits it into its own file and
a page fetches only the language and length it plays.

| Entry point | Export | What it holds |
| --- | --- | --- |
| `@johnmorrisdotca/kotoba/words-en` | `EN_WORDS` | English, by length: easy answers, answers, and every word that may be guessed |
| `@johnmorrisdotca/kotoba/words-fr` | `FR_WORDS` | French, the same shape |
| `@johnmorrisdotca/kotoba/words-de` | `DE_WORDS` | German, the same shape, with Ä, Ö and Ü |
| `@johnmorrisdotca/kotoba/pop-answers` | `POP_ANSWERS`, `POP_CATEGORIES` | Pop-culture answers, each with its category as a clue |
| `@johnmorrisdotca/kotoba/pop-guesses` | `POP_GUESSES` | Dictionary guesses at three and seven letters for the pop list |
| `@johnmorrisdotca/kotoba/kana-3`, `/kana-4`, `/kana-5` | `JA_WORDS_3`, `JA_WORDS_4`, `JA_WORDS_5` | Japanese words of three, four and five kana, packed; read with `unpack` |

`readWordLists(data, size)` reads one length of an alphabet list; `unpack(packed,
size)` reads a kana list.

## The rules

| Export | What it does |
| --- | --- |
| `markGuess(guess, hidden)` | Each letter `hit`, `near` or `miss`, counting a letter only as often as the word holds it |
| `encodeHidden`, `decodeHidden`, `decodeGuesses`, `ALPHABETS` | A hidden word and guesses written down and read back, checked against the language's alphabet |
| `readWordLists`, `unpack`, `KANA_SIZES` | Reading the lists |
| `WORD_SCORE` and the scoring functions | Points for a solved game: letters placed, rows to spare, speed |
| Keyboard rows | The on-screen keyboard's rows for each language |
| `markKanaGuess`, `kanaBase`, `kanaFamily`, `kanaTone`, `kanaFound`, `toggleSize`, `cycleMark`, … | Marking a kana guess, where a kana's voiced and small forms count as its family |
| `readRomaji`, `finishRomaji` | Typing kana with a Latin keyboard |
| Kana scoring | Points for a solved kana game |
| `GomojiLanguage`, `LetterMark`, `WordData`, `WordLists`, `Packed`, `KanaWords`, … | The types |
| `VERSION` | This package's version |

## API

The [API reference](https://johnmorrisdotca.github.io/kotoba/api.html) (also kept in the repository as [`docs/api.md`](https://github.com/johnmorrisdotca/kotoba/blob/main/docs/api.md)) lists every export of every entry point, each word list included, with its signature and its doc comment. It is made from the source by `pnpm docs:api`, and a test fails when it falls behind the code.

## Architecture

The marking rules, the scores and the keyboards are plain functions with no
DOM and no dependency. Each word list is an entry point of its own, so a page
loads only the list it plays, and `lists.ts` reads one once it is loaded. The
Japanese side (`kana/`) has the same shape as the English: marks, a score, and
a way to type kana from a keyboard with no Japanese input.

```text
src/
├── index.ts         the main entry: the marking rules, scoring, keyboards, kana helpers and a reader for the lists
├── keyboardRows.ts  the physical keyboard drawn under a grid, by language: QWERTY, AZERTY and QWERTZ
├── lists.ts         reading a word list once it is loaded; each list is its own entry point
├── marks.ts         marking a guess: the rule every five-letter word game shares
├── version.ts       the package's version
├── wordScore.ts     what a word scores, won or lost
├── kana/  the Japanese side of the games
│   ├── kanaMarks.ts  how a kana guess is coloured, including a kana of the wrong size or mark
│   ├── kanaScore.ts  what a kana word scores, on the same scale as English
│   └── romaji.ts     romaji typed into kana, with no input-method library
└── lists/  the word lists, each its own entry point so a page loads only what it plays
    ├── kana-3.data.ts       the three-kana words
    ├── kana-4.data.ts       the four-kana words
    ├── kana-5.data.ts       the five-kana words
    ├── pop-answers.data.ts  the pop-culture answers
    ├── pop-guesses.data.ts  the pop-culture guesses accepted at three and seven letters
    ├── words-de.data.ts     the German words
    ├── words-en.data.ts     the English words
    └── words-fr.data.ts     the French words
```

Tests sit beside the code they test (`*.test.ts`), and
`src/wordLists.coverage.test.ts` holds the lists to their rules. `scripts/`
builds the lists from their sources, checks the package as npm packs it and
makes the API reference, `docs/api.md`, and builds the demo (`pnpm site`) and
tests it in a real browser (`pnpm test:demo`); `demo/` is the page published on
GitHub Pages.

## The name

*Kotoba* is 言葉 (ことば), "words" in Japanese.

## Where the words come from, and their licences

The code is MIT. The lists are data under their sources' terms, written out in
full at the top of each list file and in [LICENSE](./LICENSE):

- **English**: SCOWL 2020.12.07 (http://wordlist.aspell.net/), under its
  permissive notice.
- **French**: Lexique 3.83, ranked by hermitdave's FrequencyWords, checked
  against Wiktionary: CC BY-SA 4.0.
- **German**: LanguageTool's german-pos-dict, ranked the same way, checked
  against Wiktionary: CC BY-SA 4.0.
- **Japanese**: JMdict, the property of the Electronic Dictionary Research and
  Development Group: CC BY-SA 4.0 and the Group's conditions. Refreshed from
  JMdict's newest release every month (`.github/workflows/jmdict-refresh.yml`).

A word is a word only if a real dictionary of the language says so; a frequency
count only ranks. The lists are made by the scripts in `scripts/`, never by hand.

## Where it is used

Kotoba holds the dictionaries of Gomoji, the five-letter word puzzle of
[itsutsu.com](https://itsutsu.com), in English, French, German, pop culture and
kana. Using it somewhere? [Tell us](https://github.com/johnmorrisdotca/kotoba/issues/new?title=Add+my+project).

### The family

- [Korokoro](https://github.com/johnmorrisdotca/korokoro): dice, with exact odds and real sounds
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu): a turning cube, with a solve you can follow
- [Toranpu](https://github.com/johnmorrisdotca/toranpu): playing cards, ten card games and three solitaires
- [Domino](https://github.com/johnmorrisdotca/domino): dominoes and Mexican Train
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu): a colour-card game in the manner of UNO
- [Tane](https://github.com/johnmorrisdotca/tane): seeded random numbers and daily seeds
- [Narabe](https://github.com/johnmorrisdotca/narabe): a rules engine for board games
- [Tenka](https://github.com/johnmorrisdotca/tenka): a game of world conquest
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji): a crossword tile race

## Roadmap

- The game modes of Gomoji (head start, twins, four at once, backwards, the
  dodger) as rules here, beside the marking
- More languages, each from a real dictionary of that language

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
