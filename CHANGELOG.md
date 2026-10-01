# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- **A Help switch in the demo.** Beside the language chooser in the family header, shared by every demo. Off (the default) the page is as it was; on, each option row (the words and the length) says in one plain line what it does, in English or Japanese, and every button in it has the same words as its hover text. Kept on the device.

### Added

- **A playable demo on GitHub Pages**, in the family's look and in English and
  Japanese (the Japanese not yet read by a native reader): the word game on
  the package's own lists in English, French, German and kana, at three
  lengths each, with the keyboard of each language, romaji typed into kana with
  keys for small and marked kana, every mark shown by shape as well as colour,
  the score, the family's cloth patches, and an API reference page in the same
  frame. Each list is fetched only when it is played. It is tested in a real
  browser on a phone and a desk (`pnpm test:demo`). The package itself is
  unchanged.

## [1.0.0] - 2026-09-30

### Added

- Word lists for English, French, German, pop culture and Japanese kana (three,
  four and five kana), each its own entry point, with the scripts that make them
  from their sources and a monthly refresh from JMdict.
- Marking a guess, scoring a solved game, the keyboard rows, kana marks and
  romaji input.
- Brought from itsutsu.com: every list is byte for byte the one its Gomoji
  played from.
