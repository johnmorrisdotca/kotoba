# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.2] - 2026-10-06

Nothing that was exported has changed.

### Changed

- The README takes the family's one layout, fully: a hero picture of the demo on a desk and on a phone in light and dark, a picture of each board (English, French, German, kana, and the other lengths), a full Examples section of fourteen examples whose output is what they print, an Accessibility section, and a short list of the calls to learn first. Its pictures are in `docs/images` (WebP, light and dark) and are retaken with `pnpm screenshots:readme` (it replaces `pnpm pictures` and the two JPEGs `docs/desktop.jpg` and `docs/phone.jpg`); they are not in the tarball, and `pnpm test:package` fails if one is.
- `pnpm test:readme` type-checks and runs every TypeScript and JavaScript example in the README against the built package, as a CI job of its own, and `pnpm check` holds the README to the family's lint (sections in order, a language on every fence, pictures with alt text, widths and captions, no marketing words, at most 64,000 characters, because npm shows only the first 65,536).
- "Where the words come from, and their licences" and "Where it is used" are one section, "Where the words come from, and where it is used", with "Used by" and "The family" under it, and the README has a Development section.
- Repository only: the package and everything it exports are unchanged. `CONTRIBUTING.md` is the family's one text with a section of its own for Kotoba, held to the master in johnmorrisdotca/.github by `src/family.test.js`; `ci.yml` and `pages.yml` are the family's one text (`pnpm check`, the demo, and the package on Linux, macOS and Windows), and any jobs of the package's own after them.
- The demo's page titles read `Kotoba · pitch`, like the rest of the family's.
- The demo's own stylesheet is `demo/kotoba.css`, named for the package like the family's.

## [1.1.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/kotoba@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.

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
