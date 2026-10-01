// The Kotoba demo: a word game over the package's lists. Pick a language and a length, guess the hidden word in
// six tries, and read the marks. The game itself (the board, the keys, the rules of a round, the marking, the romaji
// reader and the score) is the package's own `mountKotoba`; this page sets it up and shows the code that makes it.
// Each list is fetched only when it is played. English or Japanese.
import { KOTOBA_STRINGS, dayKey, kotobaSay } from "./dist/index.js";
import { WORD_LIST_SIZES, loadWordList } from "./dist/load.js";
import { mountKotoba } from "./dist/play.js";

const $ = (id) => document.getElementById(id);

// The page's own words, beside the game's (KOTOBA_STRINGS). The Japanese has not yet been read by a native reader: the page says so in Japanese only.
const PAGE = {
  en: {
    pitch: "Guess the hidden word in six tries, in English, French, German or Japanese kana. Each guess is marked: right place, elsewhere in the word, or not in it. The lists, the marking and the score are the Kotoba package's.",
    name: "Kotoba is 言葉, “words”.",
    nameLink: "About the name",
    pageApi: "API reference",
    pageBack: "The game",
    pageApiIntro: "Every export of every entry point, each word list included, with its signature and its doc comment. Made from the source when the site is built, so it cannot fall behind the code.",
    pageSetup: "Set up the word",
    pageLanguage: "Words",
    pageLength: "Length",
    pageEasy: "Easy words",
    pageDaily: "Today's word",
    pageNew: "New word",
    pageCredits: "Where the words come from",
    creditLetters: "The word lists were made from open dictionaries and cleaned of names, brands and subtitle noise; the package's README names each source and its licence.",
    creditKana: "The Japanese words are from JMdict ({release}), the Electronic Dictionary Research and Development Group's dictionary, used under its licence (CC BY-SA 4.0).",
    counts: "This list: {easy} easy answers, inside {answers} answers, inside {allowed} words that may be guessed.",
    dailyNote: "Today's word is the same for everybody ({day}, UTC) and changes at midnight UTC.",
    usingTitle: "Using it",
    usingText: "The game above is this package: the board, the keys, the rules of a round, the marking and the score all come from it. This is all it takes to put the game you are looking at on your own page.",
    usingCode: "In code",
    usingCli: "From a terminal",
    usingCliText: "The same lists from the command line, with nothing to install; the language follows your system, or --lang ja.",
    usingCopy: "Copy the code",
    usingCopyLink: "Copy link to this game",
    usingCopied: "Copied",
    usingCopyFailed: "Copy it by hand",
    foot: "Open source under the MIT licence. Nothing here is stored or sent anywhere.",
  },
  ja: {
    pitch: "隠された単語を6回までに当てます。英語、フランス語、ドイツ語、日本語（かな）から選べます。毎回、場所が合っているか、単語のほかの場所にあるか、含まれないかが示されます。単語リスト、判定、得点は Kotoba パッケージのものです。",
    name: "「Kotoba」は「言葉」です。",
    nameLink: "名前について（英語）",
    pageApi: "API リファレンス",
    pageBack: "ゲーム",
    pageApiIntro: "すべてのエントリポイントのすべてのエクスポートを、単語リストも含めて、シグネチャとドキュメントコメントつきで載せています。サイトをビルドするときにソースから作るので、コードとずれません。",
    pageSetup: "単語の設定",
    pageLanguage: "言葉",
    pageLength: "長さ",
    pageEasy: "やさしい単語",
    pageDaily: "今日の単語",
    pageNew: "新しい単語",
    pageCredits: "単語の出どころ",
    creditLetters: "単語リストは公開辞書から作り、人名・ブランド名・字幕のノイズを取り除いています。出どころとライセンスは README に書いてあります。",
    creditKana: "日本語の単語は JMdict（{release}）から。電子辞書研究開発グループの辞書で、そのライセンス（CC BY-SA 4.0）のもとで使っています。",
    counts: "このリスト: やさしい答え{easy}語、答え{answers}語、推測できる単語{allowed}語（やさしい答えは答えの中、答えは推測できる単語の中にあります）。",
    dailyNote: "今日の単語は誰にとっても同じ（{day}、UTC）で、UTCの午前0時に変わります。",
    usingTitle: "使い方",
    usingText: "上のゲームは、このパッケージそのものです。盤面、キー、ラウンドのルール、判定、得点はすべてパッケージのものです。いま見ているゲームは、下のコードだけで自分のページに置けます。",
    usingCode: "コードで",
    usingCli: "ターミナルで",
    usingCliText: "同じリストをコマンドラインで。インストールは不要です。言語はシステムに従います（--lang ja でも指定できます）。",
    usingCopy: "コードをコピー",
    usingCopyLink: "このゲームのリンクをコピー",
    usingCopied: "コピーしました",
    usingCopyFailed: "手でコピーしてください",
    foot: "MITライセンスのオープンソースです。ここでは何も保存せず、どこにも送りません。",
  },
};
const WORDS = { en: { ...KOTOBA_STRINGS.en, ...PAGE.en }, ja: { ...KOTOBA_STRINGS.ja, ...PAGE.ja } };

const asked = new URLSearchParams(location.search);
const WORD_NAMES = ["en", "fr", "de", "ja"];
const state = {
  words: WORD_NAMES.includes(asked.get("words")) ? asked.get("words") : "en",
  size: 5,
  easy: asked.get("easy") === "1",
  daily: asked.get("daily") === "1",
  // A seed in the address picks the first word only: a new word after it is a different one.
  seed: /^\d{1,10}$/.test(asked.get("seed") ?? "") && Number(asked.get("seed")) <= 4294967295 ? Number(asked.get("seed")) : null,
};
state.size = WORD_LIST_SIZES[state.words].includes(Number(asked.get("size"))) ? Number(asked.get("size")) : state.words === "ja" ? 4 : 5;
const drawSeed = () => Math.floor(Math.random() * 4294967295);

const language = familyLanguage({ id: "kotoba", words: WORDS, onChange: (lang) => {
  play.setLocale(lang);
  draw();
} });
const t = (key, values = {}) => kotobaSay(language.word(key), values);
const isKana = () => state.words === "ja";

let play = null;
let release = "";
let counts = null;
const letGo = (event) => {
  if (event.detail > 0) event.currentTarget.blur();
};

/** The address names this game, so that copying it shares it. */
function writeAddress() {
  const query = new URLSearchParams(location.search);
  query.set("words", state.words);
  query.set("size", String(state.size));
  if (state.easy) query.set("easy", "1"); else query.delete("easy");
  if (state.daily) {
    query.set("daily", "1");
    query.delete("seed");
  } else {
    query.delete("daily");
    query.set("seed", String(state.seed));
  }
  history.replaceState(history.state, "", `${location.pathname}?${query}${location.hash}`);
}

/** A new round of what is chosen. `fresh` draws a new seed; the first round takes the address's. */
async function deal(fresh) {
  if (fresh || state.seed === null) state.seed = drawSeed();
  writeAddress();
  draw();
  const list = await loadWordList(state.words, state.size);
  counts = { easy: list.easy.length, answers: list.answers.length, allowed: list.allowed.size };
  release = list.release ?? "";
  await play.newGame({ words: state.words, size: state.size, easy: state.easy, seed: state.seed, daily: state.daily });
  draw();
}

/** The code that puts this game on a page: made from the choices on the page, so it is always the game on the table. */
function usingCode() {
  const options = [`words: "${state.words}"`, `size: ${state.size}`, ...(state.easy ? ["easy: true"] : []), state.daily ? "daily: true" : `seed: ${state.seed}`, `locale: "${language.lang}"`];
  return `import { mountKotoba } from "@johnmorrisdotca/kotoba/play";

const play = mountKotoba(document.getElementById("game"), { ${options.join(", ")} });
await play.ready;            // the list is fetched, and the round dealt
play.game.hidden;            // the word to find (a round is plain data: guesses, typed, status, score)
await play.newGame({ seed: 7 });   // another round, the same choices`;
}

function draw() {
  const sizes = WORD_LIST_SIZES[state.words];
  const holder = $("sizes");
  if (holder.dataset.lang !== state.words) {
    holder.dataset.lang = state.words;
    holder.replaceChildren(
      ...sizes.map((size) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.size = String(size);
        button.addEventListener("click", (event) => {
          letGo(event);
          state.size = size;
          deal(true);
        });
        return button;
      }),
    );
  }
  for (const button of holder.children) {
    button.textContent = t(isKana() ? "kana" : "letters", { n: button.dataset.size });
    button.setAttribute("aria-pressed", String(Number(button.dataset.size) === state.size));
  }
  for (const button of $("languages").children) button.setAttribute("aria-pressed", String(button.dataset.langId === state.words));
  $("easy").setAttribute("aria-pressed", String(state.easy));
  $("daily").setAttribute("aria-pressed", String(state.daily));
  $("credit").textContent = state.daily ? t("dailyNote", { day: dayKey(Date.now()) }) + " " + t(isKana() ? "creditKana" : "creditLetters", { release }) : t(isKana() ? "creditKana" : "creditLetters", { release });
  $("counts").textContent = counts === null ? "" : t("counts", counts);
  $("using-code").textContent = usingCode();
  $("cli-code").textContent = state.daily ? `npx @johnmorrisdotca/kotoba daily --words ${state.words} --size ${state.size}${state.easy ? " --tier easy" : ""}` : `npx @johnmorrisdotca/kotoba lists --words ${state.words}`;
}

if (state.seed === null) state.seed = drawSeed();
play = mountKotoba($("board"), {
  words: state.words,
  size: state.size,
  easy: state.easy,
  seed: state.seed,
  daily: state.daily,
  locale: language.lang,
  // The board sits on the cloth of the page.
  theme: { "--kt-board": "transparent", "--kt-ink": "var(--felt-ink)" },
});

for (const button of $("languages").children) {
  button.addEventListener("click", (event) => {
    letGo(event);
    state.words = button.dataset.langId;
    state.size = state.words === "ja" ? 4 : 5;
    deal(true);
  });
}
$("easy").addEventListener("click", (event) => {
  letGo(event);
  state.easy = !state.easy;
  deal(true);
});
$("daily").addEventListener("click", (event) => {
  letGo(event);
  state.daily = !state.daily;
  deal(true);
});
$("new").addEventListener("click", (event) => {
  letGo(event);
  state.daily = false;
  deal(true);
});

/** Put text on the clipboard and say so on the button for a moment. */
async function copy(button, text, label) {
  let said = t("usingCopied");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    said = t("usingCopyFailed");
  }
  button.textContent = said;
  button.dataset.said = "true";
  setTimeout(() => {
    button.textContent = t(label);
    delete button.dataset.said;
  }, 1500);
}
$("copy-code").addEventListener("click", () => copy($("copy-code"), $("using-code").textContent, "usingCopy"));
$("copy-link").addEventListener("click", () => copy($("copy-link"), location.href, "usingCopyLink"));

// A test may look at the round: only where the page is told it is under test.
if (window.kotobaTest === true) window.kotobaState = { get hidden() { return play.game?.hidden; }, get play() { return play; } };

// The first round is the one `mountKotoba` dealt: the page learns of its list and shows what it chose.
const list = await loadWordList(state.words, state.size);
counts = { easy: list.easy.length, answers: list.answers.length, allowed: list.allowed.size };
release = list.release ?? "";
await play.ready;
writeAddress();
draw();
document.documentElement.dataset.ready = "true";
