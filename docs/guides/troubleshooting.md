---
title: "Troubleshooting and FAQ"
section: troubleshooting
order: 9
description: "Interpret null lists, refused guesses and incomplete mounts."
---

## Null and refusal mean different things

`loadWordList` and `readWordLists` return `null` for unsupported lengths. `decodeHidden` and `decodeGuesses` return `null` for invalid size/alphabet codes. `kanaFamily` returns `null` when a character has no gojūon family; the long bar is such a character. A mounted `game` can be `null` while its list loads or after a failed setup: await `ready` and inspect it.

A submission instead returns `{game,refused}`. `too-short` and `not-a-word` leave the guess unaccepted, while `refused:null` means acceptance. Exact kana bases with wrong size/voicing do not win. A missing interpolation value stays in braces.

## Stable daily and host input

Invalid dates and time zones throw; an empty daily pool or invalid count is not a valid puzzle. Pin pool contents and ordering for shared daily answers. If multiple elements react to one key, use the focused native element or a mount `keyboardTarget`; editable inputs are ignored. Destroy removed mounts to release listeners. If an element appears unregistered, import `/element/define` or call `defineGame` with an available registry. See [embeds](embeds.md), [daily](daily.md) and [the string list](../strings-ja.md).
