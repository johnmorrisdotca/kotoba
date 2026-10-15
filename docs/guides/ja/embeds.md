---
title: "標準の単語ゲームを埋め込む"
section: how-to
order: 6
description: "ゲームを設置し、キーボードの範囲と後片付けを扱います。"
---

## 設置して読込を待つ

```ts no-run
import {mountKotoba} from "@johnmorrisdotca/kotoba/play";
const host = document.createElement("div");
document.body.append(host);
const play = mountKotoba(host,{words:"en",size:5,seed:42,keyboardTarget:host,onFinish:game=>console.log(game.status)});
await play.ready;
console.log(play.game?.status);
play.destroy();
```

ハンドルはすぐ返りますが、読込中や問題を作れないとき`game`は`null`です。`ready`を待って確認し、ホストを取り除くときは破棄します。SDKは標準でdocumentのキーを聞くため、範囲を限定するには`keyboardTarget`を渡します。要素はフォーカスのあるホストだけを扱い、複数の埋め込みや外の入力と独立します。

## 要素とiframe

`/element/define`を読み、`<kotoba-game words="en" letters="5" daily="today"></kotoba-game>`を置きます。[ビルダー](https://johnmorrisdotca.github.io/kotoba/builder.html)で操作を確認し、各種コードをコピーできます。`letters`は単語の長さ、`size`は表示幅です。コールバック、言語、表示の変更はゲームを保ち、構築用の設定変更では再設置する場合があります。

操作と終了のdetailは答えも含むので、信頼できるホストで使います。iframeのイベントではoriginと送信元windowを確認します。iframeは回答を保存しません。[全仕様](../../embeds.md)に優先順、イベント、プロパティがあります。
