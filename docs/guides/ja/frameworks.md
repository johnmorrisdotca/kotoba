---
title: "React・Vue・Svelte・Angular"
section: how-to
order: 16
description: "React・Vue・Svelte・Angular でゲームの要素を使います。サーバーでの描画も壊れないインポートです。"
---

`<kotoba-game>` は Web コンポーネントなので、どのフレームワークでも使えます。共通の注意が2つあります。

1. **タグを登録する入口を読み込みます**（`@johnmorrisdotca/kotoba/element/define`）。サーバーで読み込んでも安全で、何も登録されません。ゲームはブラウザーで描かれます。
2. **そのタグがあることをフレームワークに伝えます。** React には型、Vue にはコンパイラーの設定、Angular にはスキーマが要ります。Svelte は何も要りません。

## React

`Game.tsx` です。React 19 は属性をそのままカスタム要素に渡します。

```tsx
import "@johnmorrisdotca/kotoba/element/define";

export function Game({ words = "en", letters = 5 }: { words?: string; letters?: number }) {
  return <kotoba-game words={words} letters={String(letters)} daily="today" />;
}
```

TypeScript では、React にタグがあることを伝えます（`kotoba-game.d.ts` のようなファイル）。

```ts no-check
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "kotoba-game": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { words?: string; letters?: string; daily?: string; easy?: boolean; seed?: string; lang?: string; size?: string; theme?: string };
    }
  }
}
```

いつもどおりに載せます。

```tsx
import { createRoot } from "react-dom/client";
import { Game } from "./Game";

createRoot(document.getElementById("root")!).render(<Game />);
```

コンポーネントは、サーバーでも文字列に描けます（`renderToString`）。パッケージのテストが確かめています。HTML にタグが入り、ゲームはブラウザーで描かれます。

```tsx
import { renderToString } from "react-dom/server";
import { Game } from "./Game";

console.log(renderToString(<Game />));
```

## Vue

```vue
<script setup lang="ts">
import "@johnmorrisdotca/kotoba/element/define";

withDefaults(defineProps<{ words?: string; letters?: number }>(), { words: "en", letters: 5 });
</script>

<template>
  <kotoba-game :words="words" :letters="letters" daily="today"></kotoba-game>
</template>
```

`kotoba-*` のタグはカスタム要素だと、Vue のコンパイラーに伝えます（`vite.config.mjs`）。

```js no-check
import vue from "@vitejs/plugin-vue";

export default {
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("kotoba-") } } })],
};
```

あとはいつもどおりに載せます。

```ts no-check
import { createApp } from "vue";
import Game from "./Game.vue";

createApp(Game).mount("#app");
```

## Svelte

```svelte
<script lang="ts">
  import "@johnmorrisdotca/kotoba/element/define";

  let { words = "en", letters = 5 }: { words?: string; letters?: number } = $props();
</script>

<kotoba-game {words} {letters} daily="today"></kotoba-game>
```

```ts no-check
import { mount } from "svelte";
import Game from "./Game.svelte";

mount(Game, { target: document.getElementById("app")! });
```

## Angular

スタンドアロンで、`CUSTOM_ELEMENTS_SCHEMA` を付けて、テンプレートに未知のタグを置けるようにします。

```ts no-check
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "@johnmorrisdotca/kotoba/element/define";

@Component({
  selector: "app-game",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<kotoba-game words="en" letters="5" daily="today"></kotoba-game>`,
})
export class GameComponent {}
```

```ts no-check
import "@angular/compiler";
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { GameComponent } from "./game.component";

void bootstrapApplication(GameComponent, { providers: [provideZonelessChangeDetection()] });
```

## Next.js・Nuxt・SvelteKit

これらはまずサーバーで描きます。上のインポートはサーバーでも安全なので、コンポーネントはそのまま動きます。Next.js の App Router では、コンポーネントのファイルの先頭に `"use client"` を書きます。
