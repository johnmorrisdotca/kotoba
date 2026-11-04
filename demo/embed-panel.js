import { embedSnippet } from "@johnmorrisdotca/kazoku-ui/embed-panel";
import "@johnmorrisdotca/kazoku-ui/embed-panel/define";
import "./dist/element-define.js";
import { VERSION } from "./dist/index.js";
import { WORD_LIST_SIZES } from "./dist/load.js";

const SITE = "https://johnmorrisdotca.github.io/kotoba/";
const NAMES = { en: "English", fr: "Français", de: "Deutsch", ja: "かな" };
const WORDS = {
  en: {
    lists: "Word list for the code",
    letters: "Length for the code",
    kana: "{n} kana",
    letter: "{n} letters",
    easy: "Easy words",
    daily: "Today's word",
    code: "mountKotoba",
  },
  ja: {
    lists: "コードの単語の一覧",
    letters: "コードの長さ",
    kana: "{n}かな",
    letter: "{n}文字",
    easy: "やさしい単語",
    daily: "今日の単語",
    code: "mountKotoba",
  },
};
const SIZE_NAMES = { 320: "small", 640: "large" };
const panel = document.getElementById("embed-panel");
const lists = document.getElementById("embed-lists");
const letters = document.getElementById("embed-letters");
const easy = document.getElementById("embed-easy");
const daily = document.getElementById("embed-daily");
const major = VERSION.split(".")[0];
const lang = () => (document.documentElement.lang === "ja" ? "ja" : "en");
const words = () => WORDS[lang()];
const heights = new Map();
const asked = new URLSearchParams(location.search);
const state = {
  words: Object.keys(NAMES).includes(asked.get("words")) ? asked.get("words") : "en",
  size: 5,
  easy: asked.get("easy") === "1",
  daily: asked.get("daily") === "1",
  seed: /^\d{1,10}$/.test(asked.get("seed") ?? "") ? Number(asked.get("seed")) : 7,
};
state.size = WORD_LIST_SIZES[state.words].includes(Number(asked.get("size")))
  ? Number(asked.get("size"))
  : state.words === "ja"
    ? 4
    : 5;

const attrs = (size) => [
  ["words", state.words],
  ["letters", String(state.size)],
  ...(state.easy ? [["easy", ""]] : []),
  ...(state.daily ? [["daily", "today"]] : []),
  ...(lang() === "ja" ? [["lang", "ja"]] : []),
  ...(SIZE_NAMES[size] === undefined ? [] : [["size", SIZE_NAMES[size]]]),
];
const query = (size) =>
  attrs(size)
    .map(([name, value]) => `${name}=${value === "" ? "on" : value}`)
    .join("&");
const heightKey = (size) => `${query(size)}`;
const spec = (size, preview) => ({
  package: "@johnmorrisdotca/kotoba",
  cdn: `https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kotoba@${major}`,
  tag: "kotoba-game",
  element: "element/define",
  entries: [],
  attrs: attrs(size),
  name: "kotoba",
  iframe: {
    src: `${preview ? "" : SITE}embed/?${query(size)}`,
    title: "Kotoba word game",
    width: size + 16,
    height: heights.get(heightKey(size)) ?? Math.ceil(size * 1.9),
  },
});
const mountCode = () => {
  const options = [
    `words: "${state.words}"`,
    `size: ${state.size}`,
    ...(state.easy ? ["easy: true"] : []),
    state.daily ? "daily: true" : `seed: ${state.seed}`,
    `locale: "${lang()}"`,
  ];
  return `import { mountKotoba } from "@johnmorrisdotca/kotoba/play";

const play = mountKotoba(document.getElementById("game"), { ${options.join(", ")} });
await play.ready;            // the list is fetched, and the round dealt
play.game.hidden;            // the word to find (a round is plain data: guesses, typed, status, score)
await play.newGame({ seed: 8 });   // another round, the same choices`;
};

const button = (id, text, pressed, press) => {
  const one = document.createElement("button");
  one.type = "button";
  one.dataset.id = String(id);
  one.textContent = text;
  one.setAttribute("aria-pressed", String(pressed));
  one.addEventListener("click", press);
  return one;
};
const draw = () => {
  panel.setAttribute("lang", lang());
  lists.setAttribute("aria-label", words().lists);
  letters.setAttribute("aria-label", words().letters);
  lists.replaceChildren(
    ...Object.keys(NAMES).map((id) =>
      button(id, NAMES[id], id === state.words, () => {
        state.words = id;
        if (!WORD_LIST_SIZES[id].includes(state.size)) state.size = id === "ja" ? 4 : 5;
        draw();
        refresh();
      }),
    ),
  );
  letters.replaceChildren(
    ...WORD_LIST_SIZES[state.words].map((size) =>
      button(size, words()[state.words === "ja" ? "kana" : "letter"].replace("{n}", size), size === state.size, () => {
        state.size = size;
        draw();
        refresh();
      }),
    ),
  );
  easy.textContent = words().easy;
  easy.setAttribute("aria-pressed", String(state.easy));
  daily.textContent = words().daily;
  daily.setAttribute("aria-pressed", String(state.daily));
  panel.labels = { code: words().code };
  panel.update();
};
const refresh = () => {
  panel.openHref = `embed/?${query(480)}`;
  panel.update();
};

panel.generate = ({ kind, size, preview }) => (kind === "code" ? mountCode() : embedSnippet(kind, spec(size, preview)));
panel.preview = ({ kind, size }) => {
  if (kind === "iframe") return undefined;
  const game = document.createElement("kotoba-game");
  for (const [name, value] of attrs(size)) if (name !== "size") game.setAttribute(name, value);
  game.setAttribute("width", String(size));
  requestAnimationFrame(() => {
    const height = Math.ceil(game.getBoundingClientRect().height) + 180;
    const key = heightKey(size);
    if (height > 180 && heights.get(key) !== height) {
      heights.set(key, height);
      panel.update();
    }
  });
  return game;
};
easy.addEventListener("click", () => {
  state.easy = !state.easy;
  draw();
  refresh();
});
daily.addEventListener("click", () => {
  state.daily = !state.daily;
  draw();
  refresh();
});
// The game above chose something: the code follows it.
document.addEventListener("kotoba-demo-game", (event) => {
  Object.assign(state, event.detail);
  draw();
  refresh();
});
document.addEventListener("kazoku-languagechange", draw);
draw();
refresh();
