---
title: "Embed in an iframe"
section: how-to
order: 14
description: "Show a Kotoba word game on a page that cannot run script, with one iframe of the embed page."
---

An iframe of the embed page needs no code of your own, and keeps the game apart from the page's styles. The address chooses what is shown. The keys are the tag's attribute names: `words`, `letters`, `daily`, `easy`, `seed`, `size`, `theme` and `lang`.

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

## Notes

- Give the frame a `title` and a size. The game fits a narrower frame, and the page inside has no scroll bars.
- The frame sends the game's events to the page as messages. Check `event.origin` and `event.source` before you read one; the finish event carries the hidden word.
- The embed page is the same game the tag draws, so the attributes of the tag ([plain HTML and CDNs](html-and-cdn.md)) and the keys of the address have the same names. The [builder](https://johnmorrisdotca.github.io/kotoba/builder.html) writes the address for you.
