---
title: "TypeScript と Node"
section: how-to
order: 17
description: "パッケージの型を使い、DOM のないサーバーでルールを動かします。"
---

パッケージは、入口ごとに自分の型を持っています。ルールは文字列と数に対する普通の関数なので、Node でも Deno でも Bun でもワーカーでもブラウザーでも、同じ呼び出しは同じ答えになります。このファイルは型を検査したあと、型を取り除く Node 22.18 以降で動かします。

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

`@ts-expect-error` は、まちがった型をコンパイラーが断ることを見せるためにあります。

## サーバーで

サーバーに DOM は要りません。プレイヤーが送ってきたものを同じルールで判定し、ブラウザーと同じ今日の単語を見つけます。

```mjs
// A server judges a guess with the same rules the game plays by: pure functions, no DOM, no browser globals.
import { dailyWord, dayKey, markGuess } from "@johnmorrisdotca/kotoba";
import { loadWordList } from "@johnmorrisdotca/kotoba/load";

const list = await loadWordList("en", 5);
const today = dailyWord(list.answers, dayKey(Date.now()), { salt: "en-5-answers" }); // the same word for everybody today
console.log(markGuess("crane", "react").join(" "), list.answers.includes(today)); // near near hit miss near true
```

ルールを1つずつ呼ぶ方法は [はじめに](getting-started.md)、ゲームをページに載せる方法は [標準の単語ゲームを埋め込む](embeds.md) にあります。
