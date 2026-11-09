# What a word means

The lists say which words are words, and nothing more; the one dictionary Kotoba carries is for English (below). A host
that has a dictionary gives the game a `meanings` function, and the game draws what comes back without adding anything to the screen's shape:

```ts no-check
mountKotoba(element, {
  words: "en",
  // Called with the word and the list's language; resolve one short plain line, or null for "nothing to say".
  meanings: async (word, words) => (await myDictionary(words)).firstSense(word),
});
```

- **A guess already made.** Tapping, hovering or focusing its row (it can be tabbed to) puts the word's meaning in the
  status line, which already kept its height, as `CRANE: a tall bird…` (`meaningFor` in `KOTOBA_STRINGS`). The line goes
  back when the pointer leaves, when you tap anywhere else, when you press Escape on the row, or when you type. Nothing
  is added to the board: no icon, no popover, no new row, and no height or width changes at any size. A press on a row
  never moves the focus, so the device's keyboard goes on typing, and the status line is a live region, so a screen
  reader hears it.
- **The hidden word.** Its meaning is asked for, and drawn as one small line on the end card under the tiles, only after
  the round is over. Before then the function is never called with it.
- **Quiet.** The function is called once for a word; the first answer may take a moment and nothing is drawn until it
  arrives. A `null`, an empty line or a rejection draws nothing at all: no placeholder, no error.
- **The colour guide** says a guess can be tapped, only when a `meanings` function was given. Without one the game is
  exactly as it was.

The meanings are the host's, and so is their licence and their credit, except the English ones below.

**English meanings are in the package.** `englishMeaning(word, words)` from `@johnmorrisdotca/kotoba/meanings-en` has the
shape of the option, so `meanings: englishMeaning` is all it takes. It answers one short line from Open English WordNet
(CC BY 4.0, derived from Princeton WordNet 3.1; see [NOTICE.md](./NOTICE.md), which a page showing them must carry): 16,822
of the 20,331 words of the 4, 5 and 6-letter lists and 97% of the answers, such as `crane: lifts and moves heavy objects`, and `plural of farm: …` for a regular plural or past form. A word WordNet lacks (`from`, `that`), or that is not for
children (a rude, sexual, drug or strong-drink word or first sense), answers `null`. Only the file for the length asked about is fetched, 54 to
187 kB gzipped; French, German and kana answer `null`.

The [demo](https://johnmorrisdotca.github.io/kotoba/) shows it with [Jisho](https://github.com/johnmorrisdotca/jisho)
(`@johnmorrisdotca/jisho`, the family's dictionary of Japanese words), a development dependency of the demo alone; Kotoba
itself depends on nothing. A kana guess is looked up there as a reading, which fetches one small piece of the dictionary, and
a reading several words share shows the commonest two or three with their written forms, as `紙 paper · 神 god · 髪 hair`,
kept to about sixty characters. Jisho's default, safe mode, leaves out what JMdict marks vulgar, X-rated, sensitive or derogatory and
never fetches the files that hold it; the demo keeps a list of its own words besides, which Jisho does not supply. The demo shows English meanings with `englishMeaning`; French and German show nothing yet. The function in `demo/meanings.js` is the
whole of the wiring:

```ts no-check
import { loadWords, wordsOf } from "@johnmorrisdotca/jisho/words";

mountKotoba(element, {
  words: "ja",
  // A line of the words Jisho has for the reading, or null for another list.
  meanings: async (word, words) => (words === "ja" ? lineOf(word, wordsOf(await loadWords(word), word)) : null),
});
```
