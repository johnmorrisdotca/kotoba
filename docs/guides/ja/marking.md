---
title: "回答の判定と得点"
section: how-to
order: 4
description: "重複する文字を判定し、位置と速度の点を計算します。"
---

## 重複文字は個数で判定する

```ts
import {markGuess,wordScore} from "@johnmorrisdotca/kotoba";
console.log(markGuess("alley","apple"));
console.log(wordScore("apple",["alley","apple"],6,20000));
```

正しい位置を先に判定し、残った文字の個数から左順に別位置の一致を判定します。重複した回答文字は、答えにある数を超えて一致しません。純粋な判定は同じ長さの標準表記を前提にします。外部入力は`decodeHidden`、`decodeGuesses`、または回答処理で検証します。

## 標準の得点

位置一致と別位置の文字は、初めて見つけたときに残り回数で重みを付けて加点します。単語を見つけるとボーナスと未使用行の点が付き、速度の点は正解した場合だけです。復元のたびに時計を読み直さず、経過ミリ秒と設定した回数を渡します。失敗でも見つけた文字の点は残ります。`submitWordGame`は短い単語や一覧にない語を拒否し、状態と理由を返します。拒否した語は一回を消費しません。[wordScore](api:wordScore)と[submitWordGame](api:submitWordGame)を参照してください。
