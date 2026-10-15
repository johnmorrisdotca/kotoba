---
title: "必要な単語一覧だけを読む"
section: how-to
order: 2
description: "直接・遅延インポートを選び、データの出典を保持します。"
---

## データの直接読込とローダー

```ts
import {readWordLists,unpack} from "@johnmorrisdotca/kotoba";
import {EN_WORDS} from "@johnmorrisdotca/kotoba/words-en";
import {JA_WORDS_3} from "@johnmorrisdotca/kotoba/kana-3";
console.log(readWordLists(EN_WORDS,5)?.easy.length,unpack(JA_WORDS_3,3).release);
```

アルファベットの一覧は長さごとに空白区切りの文字列を保持します。`readWordLists`は易しい答え、全答え、回答可能な集合を返し、ない長さには`null`です。かなのデータは対応表で圧縮され、`unpack`は元のリリース情報も返します。`/load`はen/fr/deの4〜6文字、jaの3〜5かなを選び、未対応のサイズは`null`です。

## 出典を保持する

答えと回答可能な単語の一覧は用途が違います。ホストの規則で意図しない限り、回答可能な全単語から答えを選ばないでください。ポップカルチャーの答えと回答も別入口です。主入口は辞書を持たず、遅延ローダーではバンドラーが別ファイルに分けられます。

配布するデータには[NOTICE.md](../../../NOTICE.md)と各一覧の通知を保持します。コードはMIT、データには元の条件があり、SCOWL、フランス語・ドイツ語の資料、JMdictの出典が記載されています。
