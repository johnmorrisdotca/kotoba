---
title: "困ったとき・よくある質問"
section: troubleshooting
order: 9
description: "nullの一覧、拒否された回答、設置中の状態を確認します。"
---

## nullと拒否は違う

`loadWordList`と`readWordLists`は未対応の長さに`null`です。`decodeHidden`と`decodeGuesses`は不正な長さや文字に`null`を返します。五十音の行を持たない文字に`kanaFamily`は`null`で、長音符も該当します。設置した`game`は読込中や設定失敗で`null`になるので、`ready`を待って確認します。

回答処理は`{game,refused}`です。`too-short`と`not-a-word`は受け付けず、`refused:null`は受理を表します。基底かなが合っても大小や濁点が違えば勝ちません。置換値がなければ波括弧のままです。

## 日替わりと入力

不正な日付やタイムゾーンは例外です。空の単語一覧や不正な個数も使えません。共有する日替わりは内容と順序を固定します。複数の盤面にキーが届くなら、フォーカスを持つ標準要素か`keyboardTarget`を使います。編集可能な入力は無視します。撤去した盤面は破棄します。要素の登録には`/element/define`または使用可能なregistryで`defineGame`を使います。[埋め込み](embeds.md)、[日替わり](daily.md)、[文字列一覧](../../strings-ja.md)を参照してください。
