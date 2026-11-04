---
title: "通常の HTML と CDN"
section: how-to
order: 13
description: "jsDelivr や unpkg の script タグ1つで、通常のページに単語ゲームを載せます。"
---

ビルドは要りません。`element/define` を読み込むと `<kotoba-game>` のタグが登録されます。CDN の script タグで読み込めば、タグがページの中でゲームを描きます。ゲームに必要な単語リストは同じ CDN から取得し、遊ぶ言語と長さの分だけです。

## jsDelivr

jsDelivr は、パッケージのファイルをそのまま配ります。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Kotoba from jsDelivr</title>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kotoba@1/dist/element-define.js"></script>
  </head>
  <body>
    <kotoba-game words="en" letters="5" daily="today"></kotoba-game>
  </body>
</html>
```

## unpkg

unpkg も同じです。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Kotoba from unpkg</title>
    <script type="module" src="https://unpkg.com/@johnmorrisdotca/kotoba@1/dist/element-define.js"></script>
  </head>
  <body>
    <kotoba-game words="en" letters="5" daily="today"></kotoba-game>
  </body>
</html>
```

## 注意

- `<script type="module">` を使います。通常の script では `import` できません。
- アドレスにはメジャーバージョン（`@1`）を入れます。使い方が変わるリリースは、自分で選んだときだけ入ります。今日の単語はリストによって決まるので、単語を変えたくないときは完全なバージョン（`@1.8.0`）を指定してください。
- ページは属性とイベントでゲームを操作します。属性の名前は [iframe で埋め込む](embed-in-an-iframe.md) に、決まりごとのすべては [標準の単語ゲームを埋め込む](embeds.md) に、表示されないときは [トラブルシューティング](troubleshooting.md) があります。
