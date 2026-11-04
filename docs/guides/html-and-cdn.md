---
title: "Plain HTML and CDNs"
section: how-to
order: 13
description: "Put a Kotoba word game on a plain page with one script tag from jsDelivr or unpkg."
---

A page needs no build step. The `element/define` entry registers the `<kotoba-game>` tag; a script tag from a CDN loads it, and the tag draws the game in the page. The word list the game needs is fetched from the same CDN, only for the language and length played.

## jsDelivr

jsDelivr serves the package's own files.

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

unpkg serves them too.

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

## Notes

- Use `<script type="module">`. A classic script cannot `import`.
- The address names the major version (`@1`), so a release that changes what you use is one you choose. A daily word depends on the list, so pin a full version (`@1.8.0`) for a word that stays put.
- The page reaches the game through its attributes and events: see [embed in an iframe](embed-in-an-iframe.md) for the attribute names, [native embeds](embeds.md) for the whole contract, and [troubleshooting](troubleshooting.md) if nothing appears.
