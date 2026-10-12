---
title: "Architecture and packed data"
section: explanation
order: 8
description: "Separate pure rules, optional dictionaries and native rendering."
---

## Source organization

The marking rules, the scores, the keyboards and the rules of a round are plain
functions with no DOM and no dependency. Each word list is an entry point of its
own, so a page loads only the list it plays, and `lists.ts` reads one once it is
loaded. The Japanese side (`kana/`) has the same shape as the English: marks, a
score, and a way to type kana from a keyboard with no Japanese input. The board
(`play.ts`) and the command line (`cli.ts`) are two faces on the same rules and
the same loader (`load.ts`).

```text
src/
├── element.ts                   # reflected word-game element
├── element-define.ts            # default tag registration
├── embed-day.ts                 # UTC embed date validation
├── index.ts         the main entry: the marking rules, scoring, keyboards, kana helpers, a round, the word of the day, the words and a reader for the lists
├── cli.ts           the command line, as a function of its arguments
├── daily.ts         a word a day: days as dates, and a pack of the list dealt by day
├── game.ts          a round of a word game, as plain data: typing, guesses, marks and the score
├── keyboardRows.ts  the physical keyboard drawn under a grid, by language: QWERTY, AZERTY and QWERTZ
├── lists.ts         reading a word list once it is loaded; each list is its own entry point
├── load.ts          loading a list by its language and size, each as a module of its own
├── marks.ts         marking a guess: the rule every five-letter word game shares
├── play.ts          the board you can put on a page, and its stylesheet
├── strings.ts       every word Kotoba says, in English and Japanese
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

Tests sit beside the code they test (`*.test.ts`), `src/wordLists.coverage.test.ts`
holds the lists to their rules, and `src/docs.test.js` holds this README's
examples and tables to the code. `bin/` is the command line's few lines. `scripts/`
builds the lists from their sources, checks the package as npm packs it
(`pnpm test:package`), runs the command line as a child process (`pnpm test:cli`),
makes the API reference, `docs/api.md`, and builds the demo (`pnpm site`) and
tests it in a real browser (`pnpm test:demo`); `demo/` is the page published on
GitHub Pages.

## Generated dictionaries

Each dictionary entry has an independent source module. Packed alphabet strings split on whitespace; kana use a release-specific alphabet/code mapping. The loader exposes read arrays and sets while preserving source release information. Loading all entries is a host choice, never required by the pure rules.

The four corpus writers use `scripts/word-list-docs.mjs` to add import examples to public data. Its `--refresh` path changes comments only, leaving corpus data, ordering and notices intact. Full dictionary generation still follows the original source workflow. [NOTICE.md](../../NOTICE.md) records data credits; the documentation site adds no runtime dependencies to the published library.
