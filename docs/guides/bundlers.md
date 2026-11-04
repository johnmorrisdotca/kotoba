---
title: "Vite and webpack"
section: how-to
order: 15
description: "Install the package and import the game element in a Vite or webpack project."
---

Install it.

```sh
npm install @johnmorrisdotca/kotoba
# or: pnpm add @johnmorrisdotca/kotoba
# or: yarn add @johnmorrisdotca/kotoba
```

Everything is an ES module with its own entry point, so a bundler keeps only what you import, and each word list is a file of its own that is fetched when that language and length are played. `@johnmorrisdotca/kotoba/element/define` registers the `<kotoba-game>` tag once.

## Vite

The page.

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

The script. Vite builds this entry with no configuration.

```ts no-check
import "@johnmorrisdotca/kotoba/element/define";

const game = document.querySelector("kotoba-game")!;
game.addEventListener("kotoba-finish", (event) => console.log((event as CustomEvent).detail.status));
```

## webpack

The entry. It makes the tag with the DOM, so no HTML is needed.

```js no-check
import "@johnmorrisdotca/kotoba/element/define";

const game = document.createElement("kotoba-game");
game.setAttribute("words", "en");
game.setAttribute("letters", "5");
game.setAttribute("daily", "today");
document.body.append(game);
```

The configuration (webpack 5 reads the package's `exports` with no help).

```js no-check
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```
