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
