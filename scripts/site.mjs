// Builds the static demo for GitHub Pages into ./site: the table's page and the API reference, each put together
// from the family's shared header and footer (scripts/family-template.mjs, which every package shares unchanged)
// and this package's own body, the two stylesheets, and the compiled library.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

import { apiBody } from "./api.mjs";
import {
  FAMILY_EMBED_BUILDER_WORDS,
  FAMILY_SCRIPT,
  familyEmbedBuilder,
  familyFooter,
  familyHead,
  familyHeader,
  familyUnreviewed,
} from "./family-template.mjs";
import { publishThumbnails, thumbnailHead } from "./family-thumbnail.mjs";

const id = "kotoba";
const ALT =
  "Kotoba: three rounds of the word game won, in English, Japanese kana and German, each guess marked tile by tile.";
const icon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='6' y='6' width='88' height='88' rx='16' fill='%232f7a4f'/%3E%3Cpath d='M30 66V34M30 50L52 34M30 50L52 66' stroke='%23fffdf8' stroke-width='9' stroke-linecap='round' fill='none'/%3E%3Ccircle cx='72' cy='66' r='7' fill='%23d9822b'/%3E%3C/svg%3E`;
const frame = ({ title, description, links, body, scripts, head = "" }) => `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({ id, title, description, ogTitle: "Kotoba 言葉 — Word lists and word-game rules", ogDescription: "Guess the hidden word in English, French, German or Japanese kana, on the Kotoba word lists." })}${head}
    <link rel="icon" href="${icon}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="kotoba.css" />
  </head>
  <body>
    <main>
      ${familyHeader({ id, links })}
${body}
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    ${scripts}
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
for (const file of ["family.css", "kotoba.css", "page.js", "phrases.js", "meanings.js"])
  cpSync(`demo/${file}`, `site/${file}`);
cpSync("dist", "site/dist", { recursive: true });
// What the demo's meanings need of Jisho: its words entry and the pieces of its dictionary a lookup by reading fetches (r…), in Jisho's
// default safe mode. Not the index of written forms (f…), which the demo never asks, not the files that hold what safe mode leaves out
// (x…, extra-manifest, common-extra), which only unfiltered mode fetches, and not the other tables.
const jisho = "node_modules/@johnmorrisdotca/jisho/dist";
cpSync(`${jisho}/words.js`, "site/jisho/words.js");
cpSync(`${jisho}/words-filter.js`, "site/jisho/words-filter.js");
cpSync(`${jisho}/data/words`, "site/jisho/data/words", {
  recursive: true,
  filter: (file) => !/\.d\.ts$|(^|[\\/])(common|common-extra|extra-manifest|f\d+|x[rf]\d+)\.data\.js$/.test(file),
});

// The page is demo/index.html; each <!-- family:key --> in it is replaced by the text below.
const pageParts = {
  head: familyHead({
    id,
    title: "Kotoba 言葉 — Word lists and word-game rules",
    description:
      "Guess the hidden word in six tries in English, French, German or Japanese kana, on the cleaned dictionaries of the Kotoba package, with its marking, romaji input and score. In English and Japanese. Free and open source.",
    ogTitle: "Kotoba 言葉 — Word lists and word-game rules",
    ogDescription: "Guess the hidden word in English, French, German or Japanese kana, on the Kotoba word lists.",
  }),
  thumbnail: thumbnailHead(JSON.parse(readFileSync("package.json", "utf8")), { alt: ALT }),
  icon,
  header: familyHeader({
    id,
    links: [
      { href: "docs/index.html", say: "pageDocs" },
      { href: "api.html", say: "pageApi" },
    ],
  }),
  unreviewed: familyUnreviewed({ id }),
  footer: familyFooter({ id }),
  script: `<script>${FAMILY_SCRIPT}</script>\n    <script type="module" src="kazoku-parts.js"></script>\n    <script type="module" src="embed-panel.js"></script>\n    <script type="module" src="page.js"></script>`,
};
writeFileSync(
  "site/index.html",
  readFileSync("demo/index.html", "utf8").replace(/<!-- family:([A-Za-z]+) -->/g, (_match, key) => pageParts[key]),
);
// The family header's language picker and theme switch, as one small module for every page of the site (the demo, the builder, the API reference and the docs).
await build({
  stdin: {
    contents:
      'import "@johnmorrisdotca/kazoku-ui/language-picker/define";\nimport "@johnmorrisdotca/kazoku-ui/theme-switch/define";\n',
    resolveDir: process.cwd(),
  },
  outfile: "site/kazoku-parts.js",
  bundle: true,
  format: "esm",
  minify: true,
  logLevel: "silent",
});
// The demo's "Put it in your page": kazoku-ui's embed panel, filled with this game's choices and code.
await build({
  entryPoints: ["demo/embed-panel.js"],
  outfile: "site/embed-panel.js",
  external: ["./dist/*"],
  bundle: true,
  format: "esm",
  minify: true,
  logLevel: "silent",
});
// The family's card, dark card and icon, at <site>/thumbnail.png, thumbnail-dark.png and icon.png.
publishThumbnails(".", "site");

const api = apiBody();
writeFileSync(
  "site/api.html",
  frame({
    title: "Kotoba API reference: every export, with its signature",
    description:
      "The API reference of the Kotoba package: every export of every entry point, with its signature and its documentation, made from the source.",
    links: [{ href: "./", say: "pageBack" }],
    body: `      ${api.html}\n      ${familyUnreviewed({ id })}`,
    scripts: `<script type="module" src="kazoku-parts.js"></script>
    <script type="module">
      const words = (pitch, back, name, nameLink, foot) => ({ pitch, pageBack: back, name, nameLink, foot });
      familyLanguage({
        id: "kotoba",
        words: {
          en: words("Every export of every entry point, each word list included, with its signature and its doc comment. Made from the source when the site is built, so it cannot fall behind the code.", "The game", "Kotoba is 言葉, “words”.", "About the name", "Open source under the MIT licence."),
          ja: words("すべてのエントリポイントのすべてのエクスポートを、単語リストも含めて、シグネチャとドキュメントコメントつきで載せています。サイトをビルドするときにソースから作るので、コードとずれません。", "ゲーム", "「Kotoba」は「言葉」です。", "名前について（英語）", "MITライセンスのオープンソースです。"),
        },
      });
    </script>`,
  }),
);
console.log(`site/ is ready (${api.total} exports in api.html): serve it, or let the Pages workflow publish it.`);

writeFileSync(
  "site/family-embed-builder.js",
  `export const FAMILY_EMBED_BUILDER_WORDS = ${JSON.stringify(FAMILY_EMBED_BUILDER_WORDS)};\nexport ${familyEmbedBuilder.toString()};\n`,
);
const builderParts = {
  builderHead: familyHead({
    id,
    title: "Kotoba · build a word game embed",
    description: "Choose a word list and daily play, preview a word game and copy its embed code.",
  }),
  builderHeader: familyHeader({
    id,
    links: [
      { href: "./", say: "toGallery" },
      { href: "docs/index.html", say: "pageDocs" },
      { href: "api.html", say: "pageApi" },
    ],
  }),
  unreviewed: familyUnreviewed({ id }),
  footer: familyFooter({ id }),
  script: `<script>${FAMILY_SCRIPT}</script>\n    <script type="module" src="kazoku-parts.js"></script>`,
};
writeFileSync(
  "site/builder.html",
  readFileSync("demo/builder.html", "utf8").replace(/<!-- family:([A-Za-z]+) -->/g, (_match, key) => builderParts[key]),
);
cpSync("demo/embed", "site/embed", { recursive: true });
for (const file of ["builder.js", "builder.css"]) cpSync(`demo/${file}`, `site/${file}`);
