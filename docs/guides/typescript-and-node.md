---
title: "TypeScript and Node"
section: how-to
order: 17
description: "Use the package's types, and run the rules on a server with no DOM."
---

The package ships its own types, for each entry point. The rules are plain functions over strings and numbers, so the same call gives the same answer in Node, Deno, Bun, a worker and a browser. This file type-checks, then runs under Node 22.18 or later, which strips the types.

```ts
import { type LetterMark, markGuess } from "@johnmorrisdotca/kotoba";
import { loadWordList } from "@johnmorrisdotca/kotoba/load";

const list = await loadWordList("en", 5);
const marks: LetterMark[] = markGuess("crane", "react");
console.log(marks.join(" "), list?.allowed.has("crane"));

// @ts-expect-error a list of words is not a mark
const wrong: LetterMark = list;
console.log(typeof wrong);
```

`@ts-expect-error` is there to show that the compiler refuses the wrong type.

## On a server

A server needs no DOM. It judges what the player sent against the same rules, and finds the same daily word the browser does.

```mjs
// A server judges a guess with the same rules the game plays by: pure functions, no DOM, no browser globals.
import { dailyWord, dayKey, markGuess } from "@johnmorrisdotca/kotoba";
import { loadWordList } from "@johnmorrisdotca/kotoba/load";

const list = await loadWordList("en", 5);
const today = dailyWord(list.answers, dayKey(Date.now()), { salt: "en-5-answers" }); // the same word for everybody today
console.log(markGuess("crane", "react").join(" "), list.answers.includes(today)); // near near hit miss near true
```

See [getting started](getting-started.md) for the rules one call at a time, and [native embeds](embeds.md) for mounting the game in a page.
