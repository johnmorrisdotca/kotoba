---
title: "A filter for children's names"
section: how-to
order: 40
description: "Check names children type before a person reviews them."
---

Use the filter for a star name, nickname or other short text a child types. It is a floor, not a wall: a person still needs to approve names. Run the same check on the server before saving.

```ts
import { checkText, isClean } from "@johnmorrisdotca/kotoba/children-filter";
console.log(checkText("Luna")); // { ok: true }
console.log(isClean("ばか")); // false
```

`checkText(text, options)` returns `{ ok: true }` or `{ ok: false, reason, word? }`. Reasons are `blocked` for a listed word, `personal` for contact or address details, and `shape` for empty, overly long or symbol-only text. The optional `word` identifies the matched list entry. `isClean` returns just the boolean.

Set `lang` to `en`, `ja`, `fr`, `de`, or `all`; it defaults to `all` so a child typing English on a Japanese page is covered. `maxLength` sets the maximum Unicode code-point length, default 40. No automatic filter catches every spelling or avoids every false hit; decide uncertain cases with a person.

The filter and its hand-made word lists are MIT licensed. They contain no JMdict-derived data.

A name that is also slang (Dick, Willy, Johnson) passes on its own and is refused beside a word that makes the joke ("Big Dick"); well-known prank names ("Mike Hunt", "Ben Dover") are refused, spaced or run together. They are a floor too: the teacher still sees every name.

Spanish, Italian and Portuguese have their own lists too (`lang: "es"`, `"it"`, `"pt"`; the default checks all seven). Respellings are seen as well: digits and symbols ("pu$$y", "pu22y"), a hidden letter ("sh*t"), and English sound-alikes ("puzzy", "phuck", "fvck"), compared whole word to whole word so names like Cassie and Charlotte pass.

Numbers: with `mode: "name"` (the default) a name needs letters, so one of only numbers and marks ("007", "3.14") is refused as `shape`; a short number beside a name passes ("Nova 7", "Kepler 452"). With `mode: "text"` numbers are allowed. In both, a number is read as a calculator shows it upside down (5318008 reads BOOBIES), and 69, 420 and 1488 on their own are refused. Four or more digits in a row are refused anyway as possibly personal (a phone number or a birth year), so "Star 2026" needs another name.
