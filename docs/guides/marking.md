---
title: "Mark guesses and score a round"
section: how-to
order: 4
description: "Handle repeated letters before awarding place and speed points."
---

## Repeated letters consume a count

```ts
import {markGuess,wordScore} from "@johnmorrisdotca/kotoba";
console.log(markGuess("alley","apple"));
console.log(wordScore("apple",["alley","apple"],6,20000));
```

Exact positions are marked first. Remaining hidden-letter counts are consumed left to right for elsewhere matches, so a repeated guess letter cannot claim more matches than the answer contains. Pure marking expects the native same-length form; use `decodeHidden`/`decodeGuesses` or the game submission layer when validating external input.

## Native scoring

Placed and elsewhere letters earn points when first discovered, weighted by the guesses remaining. Finding the word adds a bonus and unused-row points; speed points apply only to a found word. Supply elapsed milliseconds and configured row count, not a new clock read for every reconstruction. A lost round can still score letter discoveries. `submitWordGame` rejects a short or unlisted guess and returns both state and refusal; it does not charge a row for a refused word. See [wordScore](api:wordScore) and [game submission](api:submitWordGame).
