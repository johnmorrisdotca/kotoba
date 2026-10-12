---
title: "かなの入力と判定"
section: how-to
order: 5
description: "未完のローマ字と、大小・濁点・同じ行を区別します。"
---

## ローマ字を少しずつ読む

```ts
import {readRomaji,finishRomaji,kanaBase,markKanaGuess,kanaFound} from "@johnmorrisdotca/kotoba";
console.log(readRomaji("kan"),finishRomaji("kan"),kanaBase("ぱ"));
console.log(markKanaGuess(["ぱ","な"],["は","な"]));
console.log(kanaFound(["ぱ","な"],["は","な"]));
```

`readRomaji` は完成したかなと未完の文字を返し、`rest` を次の入力まで保持します。送信時は `finishRomaji` で確定します。標準の状態では削除は未完のローマ字を先に消し、その後かなを消します。大小と濁点の操作は最後のかなに作用し、アルファベットでは変わりません。

## 完成の条件

かなの判定は位置一致、別位置、同じ五十音の行、なしを区別します。同じ基底かなでも大小や濁点が違えば矢印が付き、完全一致まで正解ではありません。長音符は行や大小・濁点を持ちません。重複かなも残りの個数で判定します。`kanaScore` は同じ行の点を加えます。[markKanaGuess](api:markKanaGuess)と [ゲームの規則](entry:main)を参照してください。
