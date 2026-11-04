---
title: "Show what an English word means"
section: how-to
order: 12
description: "Hand the board the English meanings that come with the package, and what they leave out."
---

## One option

The board draws what a word means when you give it a `meanings` function. For the English lists the package has one, `englishMeaning`, which has the shape the option wants.

```ts
import {englishMeaning} from "@johnmorrisdotca/kotoba/meanings-en";
console.log(await englishMeaning("crane"));
console.log(await englishMeaning("farms"));
console.log(await englishMeaning("from"));
console.log(await englishMeaning("crane","fr"));
```

A page passes it as it is: `mountKotoba(element, { words: "en", meanings: englishMeaning })`. A guess that is tapped then shows the line, and the hidden word's line is on the end card when the round is over.

## What it answers

- **One short line** of at most 70 characters: the first definition of the word's first entry (a noun before a verb) in Open English WordNet, cut at the first semicolon.
- **A form of a word** shows the word's line after what it is: `plural of farm: …`, `past form of walk: …`, `comparative of tall: …`, and `form of eat: …` for an irregular one.
- **Nothing (`null`)** for a word WordNet has no entry for (`from`, `that`: it holds no function words), for any list but English, and for a word that is not for children. A word is left out when its line, or the word, is vulgar, offensive, derogatory, sexual, violent or about drink; the first definition decides, so a word with a rude sense further down (`blue`) keeps its first. No filter is perfect, and a site for children should read what it shows.

It covers 16,841 of the 20,334 words of the 4, 5 and 6-letter lists, and 97% of the answers.

## Only what is asked for

Each length of word has a file of its own (`meanings-en-4`, `meanings-en-5`, `meanings-en-6`, 56 to 193 kB gzipped), fetched the first time a word of that length is asked about and kept. A page that never asks fetches nothing. `readMeanings` turns a file into a map from word to line, for a program that reads the files itself.

```ts
import {readMeanings} from "@johnmorrisdotca/kotoba/meanings-en";
import {EN_MEANINGS_4} from "@johnmorrisdotca/kotoba/meanings-en-4";
const meanings=readMeanings(EN_MEANINGS_4);
console.log(meanings.size,meanings.get("able"));
```

## Where the meanings come from

Open English WordNet, by the Open English WordNet team under CC BY 4.0, derived from Princeton WordNet 3.1 (Copyright 2011 Princeton University), under the WordNet licence. A page that shows these meanings must carry both notices; [NOTICE.md](https://github.com/johnmorrisdotca/kotoba/blob/main/NOTICE.md) has the text and wording to use.
