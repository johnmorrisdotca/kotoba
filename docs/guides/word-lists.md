---
title: "Load only the needed word lists"
section: how-to
order: 2
description: "Choose direct or lazy imports and preserve the data credits."
---

## Direct data or a named loader

```ts
import {readWordLists,unpack} from "@johnmorrisdotca/kotoba";
import {EN_WORDS} from "@johnmorrisdotca/kotoba/words-en";
import {JA_WORDS_3} from "@johnmorrisdotca/kotoba/kana-3";
console.log(readWordLists(EN_WORDS,5)?.easy.length,unpack(JA_WORDS_3,3).release);
```

The alphabet lists contain whitespace-separated strings by length. `readWordLists` returns easy answers, all answers and the allowed-guess set, or `null` for an absent length. Kana data packs one character per kana; `unpack` uses its alphabet/code mapping and returns the source release too. `/load` chooses en/fr/de at 4–6 letters or ja at 3–5 kana and returns `null` for unsupported sizes.

## Keep the source terms

Answer pools and allowed guesses have different jobs. Do not choose a hidden word from the entire allowed set unless that is your host's intended rule. Pop-culture answers and guesses have separate entries. The root rules import carries no dictionary; a bundler can split the lazy loader's reachable lists into chunks.

Keep [NOTICE.md](../../NOTICE.md) and the list's own notices with data you distribute. The package documents SCOWL, French/German sources and JMdict, with MIT code and the data's own terms.
