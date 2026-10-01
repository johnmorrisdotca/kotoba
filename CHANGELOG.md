# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2026-10-01

### Added

- **A word game you can put on a page**: `mountKotoba` (`@johnmorrisdotca/kotoba/play`) draws the board of guesses, the keyboard of the language (QWERTY, AZERTY, QWERTZ with ä ö ü, or kana typed in romaji with keys for small and marked kana) and the legend of the marks into one element, and plays by touch or by the device's keyboard. Every mark has a shape as well as a colour; every colour and size is a CSS variable (`--kt-…`); `newGame`, `setLocale`, `onFinish` and `destroy` are the controls. It is the demo's board, moved into the package so that anybody can take it.
- **A round of a word game as plain data** (`startWordGame`, `typeWordGame`, `eraseWordGame`, `changeWordGame`, `submitWordGame`, `guessMarks`, `keyMarks`): the rules the board plays by, usable without a board, in any framework's state or by a program.
- **A word of the day**: `dailyWord(words, day, { salt, zone })`, with `dayKey`, `dayNumber`, `isDayKey` and `dailyIndex`. The same for everybody, every word once before any comes round again, with no state kept. It depends on the list's length and order, which the README says plainly.
- **`loadWordList(language, size)`** (`@johnmorrisdotca/kotoba/load`): one list by name, as its own module.
- **A command line**, `kotoba`: `check` looks a word up (exit code 1 for one that may not be guessed), `list` lists a list by tier, `mark` marks a guess, `daily` gives the word of the day (`--date`, `--zone`) and `lists` counts every list. All take `--json` and `--lang en|ja`. The whole of it is `runCli` (`@johnmorrisdotca/kotoba/cli`), tested as plain data and as a child process on Linux, macOS and Windows.
- **The words of a game in English and Japanese**: `KOTOBA_STRINGS`, with `kotobaSay` and `kotobaLanguage`. The Japanese has not yet been read by a native reader; every string is listed in `docs/strings-ja.md`.
- **A README** with the sections a package of the family has (Use it in your project, Features, The lists, A round, A word a day, Play it on a page, The command line, Theming, Limits, Browser and runtime support, Languages, The family, Licence), held to the code by `src/docs.test.js`. Issue templates (including *A word that is wrong* and *Suggest a word list*), a security policy and more keywords.
- **The demo** has a *Today's word* button, a *Using it* panel (the code that puts the game on a page, and the command, made from the choices on the page), a link that names the game (the list, the length, easy words and the seed or the day are in the address), and the counts of the list being played.
- A Help switch in the demo. Beside the language chooser in the family header, shared by every demo. Off (the default) the page is as it was; on, each option row (the words and the length) says in one plain line what it does, in English or Japanese, and every button in it has the same words as its hover text. Kept on the device.
- A playable demo on GitHub Pages (published before this release), in the family's look and in English and Japanese: the word game on the package's own lists in English, French, German and kana, at three lengths each, every mark shown by shape as well as colour, the score, the family's cloth patches, and an API reference page in the same frame.

### Changed

- **The licence is the plain MIT text, and the lists' terms are in `NOTICE.md`.** GitHub could not read a licence file that carried the word lists' terms after the MIT text, and reported none. `LICENSE` is now the MIT licence alone, so it is recognised; `NOTICE.md`, shipped in the package, sets out the terms of every list (SCOWL's notice, and CC BY-SA 4.0 for French, German and Japanese), as each list's own file already did. Nothing about the terms themselves changed.
- **Node 22 or later** is what the package declares (`engines`) and is tested on; Node 20 reached its end of life.

## [1.0.0] - 2026-09-30

### Added

- Word lists for English, French, German, pop culture and Japanese kana (three,
  four and five kana), each its own entry point, with the scripts that make them
  from their sources and a monthly refresh from JMdict.
- Marking a guess, scoring a solved game, the keyboard rows, kana marks and
  romaji input.
- Brought from itsutsu.com: every list is byte for byte the one its Gomoji
  played from.
