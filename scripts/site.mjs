// Builds the static demo for GitHub Pages into ./site: the table's page and the API reference, each put together
// from the family's shared header and footer (scripts/family-template.mjs, which every package shares unchanged)
// and this package's own body, the two stylesheets, and the compiled library.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

import { apiBody } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "kotoba";
const icon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='6' y='6' width='88' height='88' rx='16' fill='%232f7a4f'/%3E%3Cpath d='M30 66V34M30 50L52 34M30 50L52 66' stroke='%23fffdf8' stroke-width='9' stroke-linecap='round' fill='none'/%3E%3Ccircle cx='72' cy='66' r='7' fill='%23d9822b'/%3E%3C/svg%3E`;
const frame = ({ title, description, links, body, scripts }) => `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({ id, title, description, ogTitle: "Kotoba 言葉: word lists and word games", ogDescription: "Guess the hidden word in English, French, German or Japanese kana, on the Kotoba word lists." })}
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
for (const file of ["family.css", "kotoba.css", "page.js"]) cpSync(`demo/${file}`, `site/${file}`);
cpSync("dist", "site/dist", { recursive: true });

writeFileSync(
  "site/index.html",
  frame({
    title: "Kotoba · a word game on the Kotoba word lists",
    description: "Guess the hidden word in six tries in English, French, German or Japanese kana, on the cleaned dictionaries of the Kotoba package, with its marking, romaji input and score. In English and Japanese. Free and open source.",
    links: [{ href: "api.html", say: "pageApi" }],
    body: readFileSync("demo/body.html", "utf8").replace("__UNREVIEWED__", familyUnreviewed({ id })).trimEnd(),
    scripts: `<script type="module" src="page.js"></script>`,
  }),
);

const api = apiBody();
writeFileSync(
  "site/api.html",
  frame({
    title: "Kotoba API reference: every export, with its signature",
    description: "The API reference of the Kotoba package: every export of every entry point, with its signature and its documentation, made from the source.",
    links: [{ href: "./", say: "pageBack" }],
    body: `      ${api.html}\n      ${familyUnreviewed({ id })}`,
    scripts: `<script type="module">
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
