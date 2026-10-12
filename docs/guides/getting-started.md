---
title: "Getting started"
section: tutorial
order: 1
description: "Load a dictionary and submit one native guess."
---

## Load and play

Install `@johnmorrisdotca/kotoba` with npm. The root entry provides pure marking, scoring, kana and game rules; `/load` fetches the chosen dictionary.

```ts
import {startWordGame,typeWordGame,submitWordGame} from "@johnmorrisdotca/kotoba";
import {loadWordList} from "@johnmorrisdotca/kotoba/load";
const words = await loadWordList("en",5);
if(!words) throw new Error("No dictionary for this size");
const game = startWordGame("en",5,"apple");
const typed = [..."apple"].reduce((state,key)=>typeWordGame(state,key,1000),game);
const result = submitWordGame(typed,words,20000);
console.log(result.refused,result.game.status,result.game.score?.total);
```

The hidden word uses the list's lowercase form. Give host clock values in milliseconds for repeatable scoring. Every rule call returns a new state; the previous state stays available. Inspect `refused` before displaying a submitted row.

Use [native embeds](embeds.md) for a playable board, [word lists](word-lists.md) for another host game, or [marking and scoring](marking.md) for a server's validation. The [root reference](entry:main) gives each exported call and checked example.
