---
title: "Embed the native word game"
section: how-to
order: 6
description: "Mount a game, scope keyboard input and clean up its listeners."
---

## Mount and await loading

```ts no-run
import {mountKotoba} from "@johnmorrisdotca/kotoba/play";
const host = document.createElement("div");
document.body.append(host);
const play = mountKotoba(host,{words:"en",size:5,seed:42,keyboardTarget:host,onFinish:game=>console.log(game.status)});
await play.ready;
console.log(play.game?.status);
play.destroy();
```

The handle exists immediately; `game` is `null` while loading or if setup cannot produce a round. Await `ready`, inspect the game and destroy the handle when removing its host. Native SDK keyboard handling is document-wide by default; supply `keyboardTarget` for a bounded host. The element scopes keys to its focused host so multiple embeds and external inputs remain independent.

## Element and frame

Import `/element/define` for `<kotoba-game words="en" letters="5" daily="today"></kotoba-game>`. The [builder](https://johnmorrisdotca.github.io/kotoba/builder.html) previews controls and emits framework/module/element/frame code. `letters` selects word length; `size` chooses display width. Callback, language and display changes preserve play, while construction-option changes may remount.

Change/finish detail includes the answer, so use it in trusted host code. Frames forward JSON-safe events; validate origin and sending window. Frames store no guesses. [The complete contract](../embeds.md) lists precedence, events and reflected properties.
