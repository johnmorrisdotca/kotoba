---
title: "Shiritori and Japanese idioms"
section: how-to
order: 11
description: "Judge a word chain with house rules, and read and search the idiom list."
---

## Judge a word chain

Shiritori is the Japanese word chain: each word starts on the kana the last one ended on, and a word ending in ん loses, because no word starts on it.

```ts
import {playShiritori,shiritoriChoices,readShiritoriWords} from "@johnmorrisdotca/kotoba";
import {JA_SHIRITORI} from "@johnmorrisdotca/kotoba/shiritori-ja";
console.log(playShiritori(["さくら"],"らくだ"));
console.log(playShiritori(["さくら"],"いぬ"));
console.log(playShiritori(["さくら"],"らいおん"));
console.log(shiritoriChoices(readShiritoriWords(JA_SHIRITORI),["さくら"])[0]);
```

`playShiritori` takes the readings so far and the word now said. It returns where the word leaves the chain, that it loses, or why it was refused: `wrong-start`, `repeated` or `not-kana`. `shiritoriChoices` works over any words with a `reading`, so a game can chain the words one learner has met as easily as the whole list. No choices left is how a chain ends without a ん.

## House rules

No two tables play alike, so two rules are options. The defaults are the forgiving ones, which keep a chain going from a small pool of words.

```ts
import {shiritoriHeadKey,shiritoriTailKey} from "@johnmorrisdotca/kotoba";
console.log(shiritoriHeadKey("がっこう"),shiritoriHeadKey("がっこう",{voicing:"kept"}));
console.log(shiritoriTailKey("コーヒー"),shiritoriTailKey("コーヒー",{longVowel:"before"}));
```

`voicing` says whether が chains from か (`"ignored"`) or only from が (`"kept"`). `longVowel` says whether コーヒー chains on the vowel it lengthens, い (`"vowel"`), or on the kana before the mark, ひ (`"before"`). A small kana always reads as its large one.

## Read and search the idioms

```ts
import {readIdioms,searchIdioms} from "@johnmorrisdotca/kotoba";
import {JA_IDIOMS} from "@johnmorrisdotca/kotoba/idioms-ja";
const idioms=readIdioms(JA_IDIOMS);
console.log(searchIdioms(idioms,"laurels")[0]);
console.log(idioms.filter((one)=>one.kind==="idiom"&&one.elementary).length);
```

Every row says whose judgement put it there. `"idiom"` is an entry JMdict itself marks idiomatic. `"expression"` is this package's own rule, for set phrases JMdict files as plain expressions: a body part, 気 or an animal, then a particle, then something said about it, with a meaning that says nothing about the thing itself. So 鼻が高い ("proud") is on the list and 手を洗う ("to wash one's hands") is not.

`meaning` is the first plain gloss of the sense that is the idiom, not of a literal sense before it, and `meanings` holds them all, because one alone can mislead. `elementary` says every kanji in the phrase is taught in Japanese elementary school, which is a fact about its kanji: nothing here is a school's list of idioms. Each list is its own entry point: to fetch one only when it is needed, `await import("@johnmorrisdotca/kotoba/idioms-ja")`.

## Add your own words for your own site

The lists are plain data once they are read, so one way to fit them to a site is to keep using the package and lay your own rows over its list, in your site's code. The package stays as it is, and a new version still brings its new words.

```ts
import {readIdioms,searchIdioms,readShiritoriWords,shiritoriChoices} from "@johnmorrisdotca/kotoba";
import {JA_IDIOMS} from "@johnmorrisdotca/kotoba/idioms-ja";
import {JA_SHIRITORI} from "@johnmorrisdotca/kotoba/shiritori-ja";
const byPhrase=new Map(readIdioms(JA_IDIOMS).map((one)=>[one.idiom,one]));
const proud=byPhrase.get("鼻が高い");
if(proud)byPhrase.set(proud.idiom,{...proud,meaning:"proud of someone",meanings:["proud of someone"]});
byPhrase.set("胸を張る",{idiom:"胸を張る",reading:"むねをはる",meaning:"to hold one's head high",meanings:["to hold one's head high"],kind:"expression",kanji:["胸","張"],elementary:true,common:false});
const idioms=[...byPhrase.values()];
console.log(searchIdioms(idioms,"head high")[0]?.idiom);
const words=[...readShiritoriWords(JA_SHIRITORI),{reading:"らむね",word:"ラムネ",meaning:"a fizzy lemon drink"}];
console.log(shiritoriChoices(words,["さくら"]).some((one)=>one.word==="ラムネ"));
```

The idioms are held by their written form, so a row of your own replaces the list's row for the same phrase, and adds a phrase the list does not have. If a later version of the list gains that phrase, yours still stands and nothing is doubled. To take a phrase out, `byPhrase.delete("…")`. The shiritori words are one list joined to another. `searchIdioms` and `shiritoriChoices` take any rows, so nothing else in your code changes.

On a row you write, `kind`, `kanji`, `elementary` and `common` are your own statement, not this package's or JMdict's. The lists leave out what the last section names because they turn up in children's games; a site that is not for children may add such a phrase this way, and that choice is the site's. A row you write yourself is yours. A row you take from the list and reword is still made from JMdict, so it stays under the licence below and keeps its credit on the screen.

## Where the words come from

Both lists are made from JMdict, and `elementary` from KANJIDIC2, the property of the Electronic Dictionary Research and Development Group, under CC BY-SA 4.0 and the Group's conditions. A page that shows these words must say so on that screen; [NOTICE.md](https://github.com/johnmorrisdotca/kotoba/blob/main/NOTICE.md) has wording to use. Anything JMdict marks vulgar, X-rated, sensitive or derogatory is left out, because these lists turn up in children's games.
