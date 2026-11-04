---
title: "しりとり、慣用句、ことわざ、四字熟語"
section: how-to
order: 11
description: "しりとりをハウスルールつきで判定し、慣用句、ことわざ、四字熟語のリストを読み、検索します。"
---

## しりとりを判定する

しりとりは、前の言葉の最後のかなで始まる言葉をつないでいく遊びです。「ん」で終わる言葉を言うと負けです。「ん」で始まる言葉がないからです。

```ts
import {playShiritori,shiritoriChoices,readShiritoriWords} from "@johnmorrisdotca/kotoba";
import {JA_SHIRITORI} from "@johnmorrisdotca/kotoba/shiritori-ja";
console.log(playShiritori(["さくら"],"らくだ"));
console.log(playShiritori(["さくら"],"いぬ"));
console.log(playShiritori(["さくら"],"らいおん"));
console.log(shiritoriChoices(readShiritoriWords(JA_SHIRITORI),["さくら"])[0]);
```

`playShiritori`は、これまでの読みと今言った言葉を受け取り、次に続くかな、負けになること、または受け付けない理由（`wrong-start`、`repeated`、`not-kana`）を返します。`shiritoriChoices`は`reading`を持つどんな言葉の集まりにも使えるので、リスト全体でも、学習者が覚えた言葉だけでも同じようにつなげられます。候補がなくなれば、「ん」がなくてもそこで終わりです。

## ハウスルール

遊び方は場によって違うので、二つのルールを選べます。既定は、少ない言葉でも続けやすいゆるやかなルールです。

```ts
import {shiritoriHeadKey,shiritoriTailKey} from "@johnmorrisdotca/kotoba";
console.log(shiritoriHeadKey("がっこう"),shiritoriHeadKey("がっこう",{voicing:"kept"}));
console.log(shiritoriTailKey("コーヒー"),shiritoriTailKey("コーヒー",{longVowel:"before"}));
```

`voicing`は、「か」のあとに「が」で続けてよいか（`"ignored"`）、「が」のあとは「が」だけか（`"kept"`）を決めます。`longVowel`は、「コーヒー」を伸ばす音の母音「い」でつなぐか（`"vowel"`）、長音符の前のかな「ひ」でつなぐか（`"before"`）を決めます。小さいかなは常に大きいかなとして読みます。

## 慣用句を読む、検索する

```ts
import {readIdioms,searchIdioms} from "@johnmorrisdotca/kotoba";
import {JA_IDIOMS} from "@johnmorrisdotca/kotoba/idioms-ja";
const idioms=readIdioms(JA_IDIOMS);
console.log(searchIdioms(idioms,"laurels")[0]);
console.log(idioms.filter((one)=>one.kind==="idiom"&&one.elementary).length);
```

どの行にも、誰の判断で載っているかが書かれています。`"idiom"`はJMdict自身が慣用句と示している項目です。`"expression"`はこのパッケージ独自のルールによるもので、JMdictでは普通の表現とされている決まり文句を拾います。体の部分、「気」、または動物に助詞と述語が続き、意味がそのもの自体に触れていないものです。ですから「鼻が高い」（proud）は載り、「手を洗う」（to wash one's hands）は載りません。

`meaning`は、慣用句にあたる語義の最初の英語訳です。その前に文字どおりの語義があっても、そちらは使いません。訳が一つだけだと誤解を招くことがあるので、`meanings`にはすべての訳が入っています。`elementary`は、句の中の漢字がすべて日本の小学校で習う漢字であることを示します。これは漢字についての事実であり、学校の慣用句リストではありません。リストはそれぞれ独立したエントリポイントです。必要になったときだけ読み込むには、`await import("@johnmorrisdotca/kotoba/idioms-ja")`と書きます。

## ことわざと四字熟語を読む、検索する

```ts
import {readSayings,searchSayings} from "@johnmorrisdotca/kotoba";
import {JA_PROVERBS} from "@johnmorrisdotca/kotoba/proverbs-ja";
import {JA_YOJIJUKUGO} from "@johnmorrisdotca/kotoba/yojijukugo-ja";
const proverbs=readSayings(JA_PROVERBS);
const compounds=readSayings(JA_YOJIJUKUGO);
console.log(searchSayings(proverbs,"monkey")[0]?.saying);
console.log(searchSayings(compounds,"two birds")[0]);
console.log(compounds.filter((one)=>one.elementary).length);
```

どちらも独立したエントリポイント（`proverbs-ja`と`yojijukugo-ja`）なので、ページは使うリストだけを取り込みます。JMdictがことわざ（929件）と四字熟語（1,831件）と示している項目を収め、それぞれに読み、英語の平易な訳、慣用句と同じ`elementary`と`common`の印が付きます。何がことわざや四字熟語かはJMdictが決めていて、このパッケージは何も足しません。`kind`もありません。JMdictが、どれかの語義を下品、成人向け、配慮が必要、または軽蔑的と示している項目は載せません。また、JMdictが印を付けていなくても、訳のどれかが性や性産業に触れている項目（朝雲暮雨は「sexual liaison」）も載せません。これらのリストは子どもの遊びに使われるからです。慣用句も同じ決まりです（股を開く、闇の女、籠の鳥は載りません）。しりとりの単語は最初の語義で決めます（セックス、売春、浮気は載りません）。どのリストも、`scripts/children-bar.mjs`の1つの関数で決め、毎月のJMdict更新もこれを使います。ただし、子ども向けに完全なリストはありません。子ども向けのサイトは、表示する行に目を通してください。

## 自分のサイトに言葉を足す

リストは読み込んだあとはただのデータです。サイトに合わせる方法の一つは、パッケージをそのまま使い、サイト側のコードで、そのリストの上に独自の行を重ねることです。パッケージには手を加えないので、新しい版が出れば、増えた言葉もそのまま使えます。

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

慣用句は表記をキーにして持っているので、独自の行は、リストにある同じ句の行と置き換わり、リストにない句なら新しく加わります。あとの版でリストにその句が入っても、独自の行が残り、二重にはなりません。句を外すには`byPhrase.delete("…")`と書きます。しりとりの言葉は、リストにもう一つのリストをつなぐだけです。`searchIdioms`も`shiritoriChoices`もどんな行でも受け取るので、それ以外のコードは変わりません。

独自の行の`kind`、`kanji`、`elementary`、`common`は、このパッケージやJMdictの判断ではなく、サイト側の判断によるものです。リストは子ども向けのゲームにも使われるため、次の節に挙げる項目を入れていません。子ども向けでないサイトなら、そうした句をこの方法で足すこともできますが、足すかどうかはサイト側の判断です。一から自分で書いた行は、自分のものです。リストから取って言い換えた行はJMdictをもとにしたままなので、次の節のライセンスのもとにあり、画面への出典表示も必要です。

## 言葉の出どころ

どのリストもJMdictから作り、`elementary`はKANJIDIC2から作っています。どちらも電子辞書研究開発グループの所有で、CC BY-SA 4.0と同グループの条件のもとで使っています。これらの言葉を表示するページでは、その画面に出典を示す必要があります。文例は[NOTICE.md](https://github.com/johnmorrisdotca/kotoba/blob/main/NOTICE.md)（英語）にあります。JMdictが卑語、成人向け、配慮が必要、または蔑称と示している項目や、訳が性や性産業に触れている項目は入れていません。これらのリストは子ども向けのゲームにも使われるからです。
