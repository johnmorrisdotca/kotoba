---
title: "Choose a stable daily word"
section: how-to
order: 3
description: "Pin the ordered word pool and define the calendar boundary."
---

## Supply a day explicitly

```ts
import {dailyWord,dayKey,isDayKey} from "@johnmorrisdotca/kotoba";
const words = ["apple","berry","lemon"];
const day = dayKey(new Date("2026-10-12T12:00:00Z"),"UTC");
console.log(isDayKey(day),dailyWord(words,day,{salt:"five-letter"}));
```

A cycle deals each pool position once before repeating. The choice depends on the day, salt, pool length and order; a changed dictionary can change the daily answer. Pin the package/list version or keep your own ordered pool when comparisons must remain stable. Repeated values in a supplied pool remain repeated positions.

## Use the same boundary everywhere

UTC is the default; `dayKey` and `DailyOptions.zone` can name an IANA time zone for host-local midnight. Invalid moments, dates, zones or nonpositive counts throw. Pass a valid nonempty pool. The element's daily attribute uses validated UTC dates, resolves today at mount time and has no rollover timer. A host-selected hidden word takes precedence, then daily, then seed. See [the embed contract](../embeds.md).
