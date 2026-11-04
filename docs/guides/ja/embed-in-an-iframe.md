---
title: "iframe で埋め込む"
section: how-to
order: 14
description: "スクリプトを動かせないページに、埋め込みページの iframe 1つで単語ゲームを載せます。"
---

埋め込みページの iframe なら、自分のコードは要りません。ゲームはページのスタイルから離れて動きます。何を表示するかはアドレスで決めます。キーはタグの属性名と同じです：`words`、`letters`、`daily`、`easy`、`seed`、`size`、`theme`、`lang`。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Kotoba in an iframe</title>
  </head>
  <body>
    <iframe
      src="https://johnmorrisdotca.github.io/kotoba/embed/?words=en&letters=5&daily=today"
      title="A word game: Kotoba, English, five letters"
      width="496"
      height="720"
      loading="lazy"
      style="border: 0; max-width: 100%"
    ></iframe>
  </body>
</html>
```

## 注意

- フレームには `title` と大きさを付けます。ゲームは狭いフレームにも収まり、中のページにスクロールバーは出ません。
- フレームは、ゲームのイベントをメッセージとしてページに送ります。読む前に `event.origin` と `event.source` を確かめてください。終了のイベントには、隠れた単語が入っています。
- 埋め込みページはタグが描くゲームと同じものなので、タグの属性（[通常の HTML と CDN](html-and-cdn.md)）とアドレスのキーは同じ名前です。[ビルダー](https://johnmorrisdotca.github.io/kotoba/builder.html)がアドレスを作ってくれます。
