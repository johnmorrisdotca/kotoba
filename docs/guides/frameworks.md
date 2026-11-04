---
title: "React, Vue, Svelte and Angular"
section: how-to
order: 16
description: "Use the game element in React, Vue, Svelte and Angular, with the import that keeps a server render working."
---

`<kotoba-game>` is a web component, so every framework can use it. Two things apply everywhere:

1. **Import the entry that registers the tag** (`@johnmorrisdotca/kotoba/element/define`). It is safe to import on a server, where it registers nothing; the game is drawn in the browser.
2. **Tell the framework the tag exists.** React needs a type for it, Vue a compiler option, Angular a schema. Svelte needs nothing.

## React

`Game.tsx`; React 19 passes attributes through to a custom element.

```tsx
import "@johnmorrisdotca/kotoba/element/define";

export function Game({ words = "en", letters = 5 }: { words?: string; letters?: number }) {
  return <kotoba-game words={words} letters={String(letters)} daily="today" />;
}
```

With TypeScript, tell React the tag exists (a file such as `kotoba-game.d.ts`).

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

Mount it as usual.

```tsx
import { createRoot } from "react-dom/client";
import { Game } from "./Game";

createRoot(document.getElementById("root")!).render(<Game />);
```

The component renders to a string on a server (`renderToString`), as the package's tests check: the tag is in the HTML and the game is drawn in the browser.

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

Tell Vue's compiler that `kotoba-*` tags are custom elements, in `vite.config.mjs`:

```js no-check
import vue from "@vitejs/plugin-vue";

export default {
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("kotoba-") } } })],
};
```

Then mount it as usual.

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

Standalone, with `CUSTOM_ELEMENTS_SCHEMA` so the template may hold an unknown tag.

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

## Next.js, Nuxt, SvelteKit

They render on a server first, and the import above is safe there, so the components work unchanged. In Next.js's App Router the component file starts with `"use client"`.
