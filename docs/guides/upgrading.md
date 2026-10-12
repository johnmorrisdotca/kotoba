---
title: "Upgrading and moving a word game"
section: upgrading
order: 10
description: "Preserve list identity, native marking and embed choices."
---

## Version 1 and dictionary releases

The current public major is 1; [the changelog](../../CHANGELOG.md) records actual changes. This docs rollout changes navigation and comments, leaving rules, dictionary values and licences intact. A dictionary refresh can change a daily answer even within the same public major. Preserve the ordered list or exact version when existing challenge links must stay comparable, and keep JMdict release credit for kana.

The embed standard adds validated daily/display choices and reflected properties. Native `letters` selects word length, `size` display width; host callbacks and construction settings have different remount behavior. `hidden` takes precedence over daily and seed. Follow [the preserved contract](../embeds.md) rather than treating a framework wrapper as a different rules engine.

## Coming from another guessing game

Map match labels explicitly to hit/near/miss and, for kana, kin plus size/voicing flags. Use the exact-first, count-consuming duplicate algorithm, not a membership-only test. Do not assume another game's score or daily selection matches Kotoba's. Keep native lowercase dictionary forms and use the package's game refusal result. No second-major migration has been published here.
