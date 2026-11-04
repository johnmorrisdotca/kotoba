---
title: "Vite と webpack"
section: how-to
order: 15
description: "パッケージを入れて、Vite や webpack のプロジェクトでゲームの要素を読み込みます。"
---

インストールします。

```sh
npm install @johnmorrisdotca/kotoba
# or: pnpm add @johnmorrisdotca/kotoba
# or: yarn add @johnmorrisdotca/kotoba
```

どれも ES モジュールで、入口が別々なので、バンドラーは読み込んだものだけを残します。単語リストはそれぞれ別のファイルで、その言語と長さで遊ぶときに取得されます。`@johnmorrisdotca/kotoba/element/define` は `<kotoba-game>` のタグを一度だけ登録します。

## Vite

ページです。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Kotoba with Vite</title>
  </head>
  <body>
    <kotoba-game words="en" letters="5" daily="today"></kotoba-game>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

スクリプトです。Vite は設定なしでこの入口をビルドします。

```ts no-check
import "@johnmorrisdotca/kotoba/element/define";

const game = document.querySelector("kotoba-game")!;
game.addEventListener("kotoba-finish", (event) => console.log((event as CustomEvent).detail.status));
```

## webpack

入口です。DOM でタグを作るので、HTML は要りません。

```js no-check
import "@johnmorrisdotca/kotoba/element/define";

const game = document.createElement("kotoba-game");
game.setAttribute("words", "en");
game.setAttribute("letters", "5");
game.setAttribute("daily", "today");
document.body.append(game);
```

設定です（webpack 5 は、パッケージの `exports` を手助けなしで読みます）。

```js no-check
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```
