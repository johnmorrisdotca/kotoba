---
title: "はじめに"
section: tutorial
order: 1
description: "辞書を読み込み、標準の回答を一回送ります。"
---

## 読み込んで遊ぶ

npm で `@johnmorrisdotca/kotoba` をインストールします。主入口には判定、得点、かな、ゲームの純粋な規則があり、`/load` が選んだ辞書を読み込みます。

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

隠す単語は辞書の小文字表記です。得点を再現するならホストの時計をミリ秒で渡します。各関数は新しい状態を返し、元の状態を残します。回答の行を表示する前に `refused` を確認します。

遊べる盤面には[埋め込み](embeds.md)、独自のゲームには[単語一覧](word-lists.md)、サーバーの検証には[判定と得点](marking.md)を参照してください。[主入口のリファレンス](entry:main)に公開関数の例があります。
