---
title: "英単語の意味を表示する"
section: how-to
order: 12
description: "パッケージに入っている英語の意味をボードに渡す方法と、含まれないもの。"
---

## 一つのオプション

ボードは、`meanings`関数を渡すと、単語の意味を表示します。英語のリストには、パッケージ自身が`englishMeaning`を用意しています。オプションがそのまま受け取れる形です。

```ts
import {englishMeaning} from "@johnmorrisdotca/kotoba/meanings-en";
console.log(await englishMeaning("crane"));
console.log(await englishMeaning("farms"));
console.log(await englishMeaning("from"));
console.log(await englishMeaning("crane","fr"));
```

ページでは、`mountKotoba(element, { words: "en", meanings: englishMeaning })`のようにそのまま渡します。すると、タップした予想に意味が出て、隠れていた単語の意味は、ラウンドが終わったときの結果カードに出ます。

## 返すもの

- **短い一行**（最大70文字）。Open English WordNetで、その単語の最初の項目（名詞、動詞の順）の最初の定義を、最初のセミコロンで切ったものです。
- **単語の変化形**には、その形の説明のあとに元の単語の行が付きます。`plural of farm: …`、`past form of walk: …`、`comparative of tall: …`、不規則な形なら`form of eat: …`です。
- **何も返さない（`null`）**場合：WordNetに項目がない単語（`from`や`that`。WordNetには機能語がありません）、英語以外のリスト、そして子どもに向かない単語です。答えとして隠さない単語（侮辱語、下品な言葉、性的なもの、お酒、薬物、殺しに関するもの）や、単語またはその行が、下品、侮辱的、軽蔑的、性的、暴力的、武器・お酒・薬物に関するものは入れません。最初の定義で決めるので、あとの語義に下品な意味がある単語（`blue`）も、最初の意味は残ります。完全なフィルターはないので、子ども向けのサイトは、表示する内容に目を通してください。

4、5、6文字のリストの20,331語のうち16,317語、答えの96%をカバーします。

## 頼まれたものだけ

単語の長さごとに別のファイル（`meanings-en-4`、`meanings-en-5`、`meanings-en-6`、圧縮後54〜187 kB）があり、その長さの単語を初めて尋ねられたときに取得して、保持します。一度も尋ねないページは何も取得しません。`readMeanings`は、ファイルを単語から行への対応表にします。ファイルを自分で読むプログラム向けです。

```ts
import {readMeanings} from "@johnmorrisdotca/kotoba/meanings-en";
import {EN_MEANINGS_4} from "@johnmorrisdotca/kotoba/meanings-en-4";
const meanings=readMeanings(EN_MEANINGS_4);
console.log(meanings.size,meanings.get("able"));
```

## 意味の出どころ

Open English WordNet（Open English WordNetチーム、CC BY 4.0）です。これはPrinceton WordNet 3.1（Copyright 2011 Princeton University）をもとにしていて、WordNetのライセンスのもとにあります。これらの意味を表示するページでは、両方の表示を付ける必要があります。文例は[NOTICE.md](https://github.com/johnmorrisdotca/kotoba/blob/main/NOTICE.md)（英語）にあります。
