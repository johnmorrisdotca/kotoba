# Contributing

Ideas, bug reports and pull requests are welcome in the
[issues](https://github.com/johnmorrisdotca/kotoba/issues).

## Working on it

```sh
pnpm install
pnpm check          # lint, types and tests (including the checks on the lists' words)
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
```

## The lists

The lists are machine output: change a script in `scripts/` and run it again,
never edit a list by hand. Each script names its sources and how to fetch them
at its top. A word is a word only if a real dictionary of the language says so;
`src/wordLists.coverage.test.ts` holds the words that once got through and must
not again.

`.github/workflows/jmdict-refresh.yml` remakes the kana lists from JMdict's
newest release on the first of each month, and leaves any change on a branch.

## Releasing

A version tag (`v1.2.3`, the same as `package.json`'s version) runs
`.github/workflows/release.yml`: it checks and builds the package, attaches the
tarball to a GitHub release, and publishes it to npm by trusted publishing,
with no token. Write the release in `CHANGELOG.md` first.
