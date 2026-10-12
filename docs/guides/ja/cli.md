---
title: "CLI とホストの検証"
section: explanation
order: 7
description: "非同期 CLI の結果と標準の状態で確認します。"
---

## 非同期 CLI の結果

```ts
import {runCli} from "@johnmorrisdotca/kotoba/cli";
const result = await runCli(["mark","apple","alley"],{locale:"en-US"});
console.log(result.code,result.out.trim(),result.err);
```

辞書を読み込むコマンドがあるので `runCli` は非同期です。プロセスへ直接書かず、出力、エラー、終了コードを返します。0、1、2 は成功、拒否された要求、不正な使用法を区別します。`npx @johnmorrisdotca/kotoba --help` で各コマンドと設定を確認します。自動処理の再現には日付とロケールを渡します。

## 答えを持つホスト

ゲームのデータには隠す単語が入ります。標準要素とイベントは信頼できるローカルホスト向けです。競技用のサーバーなら答えと正式な状態をサーバーに保持し、語を検証して、必要な判定だけをクライアントに返します。ブラウザーの経過時間はホストの申告です。日替わりの比較は名前だけでなく、固定した順序付き一覧に依存します。[コマンドライン](../../../README.md#the-command-line)と [判定](marking.md)を参照してください。
