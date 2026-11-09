---
title: "子どもが入力する名前のフィルター"
section: how-to
order: 40
description: "子どもが入力した名前を、人が確認する前に調べます。"
---

星の名前やニックネームなど、子どもが入力する短い文に使います。これは最初のチェックであり、すべてを防ぐ壁ではありません。名前は最後に人が確認してください。保存する前にサーバーでも同じチェックを行います。

```ts
import { checkText, isClean } from "@johnmorrisdotca/kotoba/children-filter";
console.log(checkText("Luna")); // { ok: true }
console.log(isClean("ばか")); // false
```

`checkText(text, options)` は `{ ok: true }`、または `{ ok: false, reason, word? }` を返します。`blocked` はリストにある言葉、`personal` は連絡先や住所、`shape` は空、長すぎる、または記号だけの入力です。`word` がある場合は、一致したリストの言葉を示します。`isClean` は真偽値だけを返します。

`lang` は `en`、`ja`、`fr`、`de`、`all` から選べます。初期値は `all` です。日本語のページで英語を入力した場合も調べます。`maxLength` は Unicode コードポイント数の上限で、初期値は 40 です。すべての書き方を見つけたり、誤判定をなくしたりはできません。迷う場合は人が判断してください。

フィルターと手作りの単語リストは MIT ライセンスです。JMdict 由来のデータは含みません。

英語のあだ名にもなる名前（Dick、Willy、Johnson）は、それだけなら通ります。冗談になる言葉と並ぶと（"Big Dick"）通りません。声に出すと別の意味になる、よく知られたいたずらの名前（"Mike Hunt"、"Ben Dover"）は、間をあけても続けて書いても通りません。これも最低限の守りなので、名前は先生が必ず確認します。

スペイン語、イタリア語、ポルトガル語にもそれぞれのリストがあります（`lang: "es"`、`"it"`、`"pt"`。何も指定しなければ7つすべてを確かめます）。書き換えも見つけます：数字や記号（"pu$$y"、"pu22y"）、伏せ字（"sh*t"）、英語の音が同じ書き方（"puzzy"、"phuck"、"fvck"）。言葉全体どうしで比べるので、CassieやCharlotteのような名前は通ります。
