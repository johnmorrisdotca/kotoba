---
title: "日替わり単語を安定させる"
section: how-to
order: 3
description: "順序付きの単語一覧と日付の境界を固定します。"
---

## 日を明示する

```ts
import {dailyWord,dayKey,isDayKey} from "@johnmorrisdotca/kotoba";
const words = ["apple","berry","lemon"];
const day = dayKey(new Date("2026-10-12T12:00:00Z"),"UTC");
console.log(isDayKey(day),dailyWord(words,day,{salt:"five-letter"}));
```

一覧の各位置を一巡してから繰り返します。日付、salt、単語数、順序によって答えが決まり、辞書の変更で日替わりの答えも変わります。比較を安定させるならパッケージや一覧の版を固定するか、自分の順序付き一覧を保持します。同じ単語が重複すれば別の位置として残ります。

## 境界をそろえる

標準はUTCです。`dayKey`と`DailyOptions.zone`はIANAのタイムゾーンを選べます。不正な日時、日付、ゾーン、正でない個数は例外です。空でない一覧を渡します。要素の日替わりはUTCの実在する日付を使い、todayは設置時に決まり、自動切替タイマーはありません。ホストの答え、日替わり、シードの順に優先します。[埋め込みの仕様](../../embeds.md)を参照してください。
