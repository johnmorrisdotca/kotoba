# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.4.0] - 2026-11-02

### Added

- A colour guide on the game itself: a labelled "Colour guide" button under the keyboard opens a dialog that shows every colour and arrow as the game draws it, each beside its name and a short sentence, with the keyboard's colours and the corner shapes that repeat them. The kana game adds yellow and the two arrows. It closes by its button, Got it, Escape or a press outside, and the game ignores the keys typed while it is open. Thirty-three new strings in `KOTOBA_STRINGS` (`guide…`, `lostTitle`, `wonTitle`, `lostNote`, `points`), English and Japanese.

### Changed

- When a round ends, the hidden word is shown as a row of large tiles in the colour of a right letter, over the keyboard's own place, with a kind note and the score, instead of a line of small text in the status. The status line keeps its words for a screen reader and its height, so nothing moves. The visible legend line under the keyboard is replaced by the colour guide; the `legendLetters` and `legendKana` strings remain.

### Fixed

- A kana with both arrows (wrong size and wrong mark) drew only the up arrow; it now draws both.

## [1.3.2] - 2026-11-02

The kana word lists are made again from JMdict's release of 2026-11-02 (they were from 2026-09-28), a word that may be guessed is never taken away because JMdict stopped listing it, and a bar on words that are not for a child now applies to the whole list. The code is unchanged.

### Changed

- **A word that may be guessed stays so.** `scripts/word-lists-ja.mjs` keeps the lists it is run over and adds what JMdict lists now, so a game somebody played, kept or half way through, is still checked against a list that has its words. JMdict stopped listing やまま (3 kana), ふかいきり and うまふぶき (5 kana); all three stay. The only way out is the bar below, and `src/kanaAllowed.test.js` holds it (a floor for each list, the words JMdict dropped, the merge, and no barred word anywhere).
- **The bar on words that are not for a child reaches the whole list.** Until now JMdict's marks for vulgar, X-rated, sensitive and derogatory kept such words out of the answers only; every reading was a word that may be guessed, which is how ほもび and ほもびでお (JMdict: gay pornographic video) came to join. A reading is now barred from the answers and the guesses alike when every entry that spells it has one of those four marks on its first sense, the rule the shiritori words use. 457 readings are barred (3 kana 78, 4 kana 226, 5 kana 153; 452 of them were guessable before), each listed with its English in `scripts/kana-barred.json`. A hand list in the script adds two readings JMdict marks nowhere (じょそこ, ひどうてい), and these existing answers are no longer hidden but stay words that may be guessed: sexual or private (うわき, おりもの, ほうきょう, なんしょく), death by one's own hand (じさつ, しんじゅう), and killing, violence and abuse (ころす, たさつ, さつじん, ひとごろし, ぎゃくさつ, あんさつ, しけい, しょけい, せっしょう, ぎせいしゃ, ひがいしゃ, じゅうげき, りゅうけつ, ぼうりょく, なぐる, だぼく, ぎゃくたい, たいけい, いじめ, ゆうかい, ひとじち). みすい stays.
- **3 kana:** the words that may be guessed go from 16,444 to 16,371 (77 left, all barred; 4 joined). Eight of the 2,000 answers are out (いじめ うわき ころす しけい じさつ たさつ だぼく なぐる) and eight in (まねー まーく みくろ みしん みせす みっか みるく むいか); of the 900 easy, ころす しけい じさつ are out and ないか ならび なんら in.
- **4 kana:** the words that may be guessed go from 39,046 to 38,844 (224 left; 22 joined). Seven answers are out (あんさつ おりもの さつじん しょけい たいけい ひとじち ゆうかい) and seven in (ちゅうや ちゅうわ ちょうか ちょくし ちらかる ちらばる ちんぼつ); of the easy, あんさつ さつじん たいけい ひとじち ゆうかい are out and ぼうぎょ ぼうどう ぼうめい まきこむ まちがい in.
- **5 kana:** the words that may be guessed go from 35,419 to 35,298 (151 left; 30 joined). Twelve answers are out (ぎせいしゃ ぎゃくさつ ぎゃくたい しんじゅう じゅうげき せっしょう なんしょく ひがいしゃ ひとごろし ほうきょう ぼうりょく りゅうけつ) and twelve in (じょうすい せばんごう だっきゃく ちゃくよう ちょうしん つみかさね ていしょう なつばしょ なまびーる はたじるし びせいぶつ ぶたいうら); of the easy, ぎゃくさつ しんじゅう ひとごろし ぼうりょく are out and ほそながい ほっきにん ほっきょく ぼうきゃく in.
- **Seeds:** a seed keeps its hidden word unless that word went or a new one undercuts it. Measured over 50,000 seeds, the hidden word changes for 0.64% of 3-kana easy, 0.74% of 3-kana medium and hard, 1.15% of 4-kana easy, 0.70% of 4-kana medium and hard, 0.92% of 5-kana easy and 1.25% of 5-kana medium and hard; the free grey first row changes for about one seed in 100 whose word stays. The words that may be guessed do not change a hidden word.
- The order of the words that stayed is the same in every list, but a list that gains or loses a word deals another pack, so a day's kana word from `dailyWord` can differ from 1.3.1 (see "What the word depends on" in the README). The idioms and shiritori lists are not changed.

## [1.3.1] - 2026-11-02

### Added

- The guide to shiritori and idioms says how a site adds its own words: keep using the package and lay your own rows over its list, in English and Japanese. Nothing in the code or the lists has changed.

## [1.3.0] - 2026-11-02

### Added

- Shiritori, the Japanese word chain: `playShiritori` judges a word, `shiritoriChoices` lists what may follow from any pool of words, `shiritoriHeadKey` and `shiritoriTailKey` say what a word starts and ends on, with house rules for voicing and the long vowel mark. The entry point `/shiritori-ja` holds 6,393 everyday nouns from JMdict, commonest first.
- Japanese idioms: the entry point `/idioms-ja` holds 2,021 set phrases from JMdict, with readings, English meanings, whose judgement put each there, and whether its kanji are all taught in elementary school (from KANJIDIC2). `readIdioms` and `searchIdioms` read them. Each list is its own entry point, so a page fetches it only when it imports it.
- The demo has a panel for each, with the source named on the screen. Both lists are CC BY-SA 4.0 and on the monthly JMdict refresh: see NOTICE.md.

## [1.2.1] - 2026-10-31

### Changed

- Biome replaces ESLint as the formatter and linter, with the family's shared settings in `scripts/biome-family.json`; `pnpm lint` checks formatting too, and `pnpm format` applies it. The code is formatted once to 120 columns. Nothing a user of the package sees has changed.
- `pnpm check` also holds every source file to at most 500 lines of code (`scripts/check-size.mjs`; blank lines, comments, tests and data files are not counted). TypeScript targets ES2022, treats an indexed read as possibly missing, and refuses switch fallthrough and unmarked overrides.

## [1.2.0] - 2026-10-14

The game is a custom element with the family's standard embed attributes and a shared builder, and the package has an English and Japanese documentation site with a checked example for every export. The rules, dictionaries, daily words and saved states are unchanged.

### Added

- Add the bilingual documentation site, checked public examples, paired guides, local search and machine-readable pages.
- Add a reflected word-game element, shared embed builder and validated iframe route with UTC daily play. Keep mounted game rules and callbacks; embed keyboards listen on the focused game and native events bubble across shadow roots.
- Share a package-independent embed builder for option controls, preview adapters, code tabs and shareable links.

### Changed

- The API link in the header reads "API" in English, so that the header takes the same number of rows in English and in Japanese on a phone, as the demo's test of a language change asks.
- Synchronize documentation tooling for repository layouts, generated type references, Node entry points and repository-specific README links.
- Keep complete resource catalogues on the documentation entry index and the active resource beside core navigation; render valid default imports in HTML and Markdown.
- Group the package family by kind, alphabetize each group, and include the geography packages and REST in Pieces in the shared footer and README.
- Update the shared family description for addresses in all seven supported countries, including France and Germany.

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
