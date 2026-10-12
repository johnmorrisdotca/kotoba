---
title: "Type and mark kana"
section: how-to
order: 5
description: "Keep unfinished romaji and distinguish size, voicing and family."
---

## Incremental romaji

```ts
import {readRomaji,finishRomaji,kanaBase,markKanaGuess,kanaFound} from "@johnmorrisdotca/kotoba";
console.log(readRomaji("kan"),finishRomaji("kan"),kanaBase("ぱ"));
console.log(markKanaGuess(["ぱ","な"],["は","な"]));
console.log(kanaFound(["ぱ","な"],["は","な"]));
```

`readRomaji` returns completed kana and an unfinished suffix; keep `rest` for the next key. `finishRomaji` flushes input when submitting. In native state, erase removes pending romaji before completed kana. Size and voicing controls affect the last kana; they leave alphabet games unchanged.

## Match enough to finish

Kana marks distinguish exact, elsewhere, same gojūon family and absent. A matching base in the correct place can still have a wrong-size or wrong-voicing arrow; it is not a completed answer until exact. The long-vowel bar has no family or size/voicing changes. Duplicate kana use remaining counts just like letters. `kanaScore` adds the same-family column component. See [markKanaGuess](api:markKanaGuess) and [game rules](entry:main).
