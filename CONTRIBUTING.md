# Contributing to Kotoba

Thank you for helping. Bug reports, ideas and pull requests are all welcome, in
the [issues](https://github.com/johnmorrisdotca/kotoba/issues). What holds for
every package of the family is in the
[family's contributing guide](https://github.com/johnmorrisdotca/.github/blob/main/CONTRIBUTING.md);
this is what is particular to Kotoba.

## Reporting a bug, or a word

A mark that is wrong is a guess and a hidden word: `markGuess("crane", "react")`
is the whole report. A word that should not be on a list, or a common word that
is missing, is *A word that is wrong*: say the word, the list and its length, and
what a real dictionary of the language says. The lists are machine output, so a
word is added or removed by changing the script's rules (or the source's own
entry), never the list.

## Making a change

```sh
git clone https://github.com/johnmorrisdotca/kotoba
cd kotoba
pnpm install
pnpm check          # lint, types and tests (including the checks on the lists' words)
pnpm test:cli       # the command line, run as a child process
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry, run the command
pnpm test:demo      # the demo in real browsers: builds it, then taps it
pnpm site           # builds the demo into ./site
```

- **The lists** are machine output: change a script in `scripts/` and run it
  again, never edit a list by hand. Each script names its sources and how to
  fetch them at its top. A word is a word only if a real dictionary of the
  language says so; `src/wordLists.coverage.test.ts` holds the words that once
  got through and must not again. `.github/workflows/jmdict-refresh.yml` remakes
  the kana lists from JMdict's newest release on the first of each month, and
  leaves any change on a branch.
- **A new list** needs a real dictionary of the language, whose licence lets its
  words be shipped and shared, named in `NOTICE.md`, in the list file's own
  header and in the README. A count of film subtitles alone once made RUDD a
  French word. No GPL or LGPL data.
- **Rules are pure.** The rules of a round (`game.ts`) return a new round and
  leave the one they were given alone. The board (`play.ts`) and the command line
  (`cli.ts`) are two faces on the same rules and the same loader (`load.ts`):
  neither decides anything the rules do not.
- **The word of the day never changes for a list.** `daily.test.ts` pins the
  words of three days. A change that moves one is a change of the list or of the
  pack, and says so in the changelog.
- **Words go in `src/strings.ts`**, in English and Japanese, then
  `pnpm docs:make` to bring `docs/strings-ja.md` up to date. Japanese is plain
  and polite. If you cannot write it, say so in the pull request.
- **Every export gets a doc comment**, and `pnpm docs:api` brings `docs/api.md` up
  to date. A test fails without either.
- **Examples and tables in the README are run by `src/docs.test.js`.** Change a
  number in one and the other has to follow.
- **Option values and names are kebab case.**
- **The demo is tested by tapping it.** `e2e/*.demo.mjs` are Playwright tests that
  open the built demo in Chromium and WebKit, at a phone's width by touch and at a
  desktop's by mouse. After every flow they check that nothing is wider than the
  screen, nothing to tap is under 44px, and the page complained of nothing. The
  first time, `pnpm exec playwright install chromium webkit` fetches the browsers.
- **`demo/family.css` and `scripts/family-template.mjs` are the family's**, the
  same in every sibling package. Do not edit them here.
- **The list of the family in the README is made, not written.** `pnpm family:readme` writes it between its
  markers from `scripts/family-template.mjs` (the names, the Japanese names and a line on each), and
  `scripts/family-readme.mjs` is the same file in every package. To add a package or change a line, change the
  template in every repository, bump `FAMILY_TEMPLATE_VERSION` and record the new hash in `src/family.test.js`.
- One change per pull request, with a line in `CHANGELOG.md` under *Unreleased*.

## Releasing

Maintainers bump the version in `package.json` and `src/version.ts`, and move
*Unreleased* to the new version in `CHANGELOG.md`, dated. A version tag
(`v1.2.3`, the same as `package.json`'s version) runs
`.github/workflows/release.yml`: it checks and builds the package, runs the packed
package and the command line, attaches the tarball to a GitHub release, and
publishes it to npm by trusted publishing with provenance, with no token. A
version already on npm is not published again.
