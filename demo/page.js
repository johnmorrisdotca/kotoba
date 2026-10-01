// The Kotoba demo: a word game over the package's lists. Pick a language and a length, guess the hidden word in
// six tries, and read the marks. The lists, the marking, the romaji reader and the score are the package's own,
// each list fetched only when it is played; this page draws the board and passes the keys on. English or Japanese.
import { KEYBOARD_ROWS, cycleMark, finishRomaji, kanaFound, markGuess, markKanaGuess, readRomaji, readWordLists, toggleSize, unpack, kanaScore, wordScore } from "./dist/index.js";

const $ = (id) => document.getElementById(id);
const ROWS = 6;

// The page's own words. The Japanese has not yet been read by a native reader: the page says so in Japanese only.
const WORDS = {
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
    pageNew: "New word",
    pageCredits: "Where the words come from",
    letters: "{n} letters",
    kana: "{n} kana",
    loading: "Loading the words…",
    ready: "Guess the {n}-letter word. Type, then press Enter.",
    readyKana: "Guess the {n}-kana word. Type it in romaji, then press Enter.",
    notWord: "That is not in the word list.",
    tooShort: "Not enough letters.",
    won: "Found it in {n}! {score} points.",
    lost: "Out of guesses. The word was {word}. {score} points.",
    enter: "Enter",
    back: "Delete",
    small: "小",
    mark: "゛゜",
    legendLetters: "Green: right place. Orange: in the word, elsewhere. Grey: not in the word.",
    legendKana: "Green: right place (an arrow if its size or mark is wrong). Orange: elsewhere. Yellow: the same row of the kana table. Grey: none of these.",
    mark_hit: "right place",
    mark_near: "elsewhere in the word",
    mark_miss: "not in the word",
    mark_kin: "same row of the kana table",
    arrow_size: "wrong size",
    arrow_tone: "wrong mark",
    empty: "empty",
    row: "Guess {n}",
    creditLetters: "The word lists were made from open dictionaries and cleaned of names, brands and subtitle noise; the packages' README names each source and its licence.",
    creditKana: "The Japanese words are from JMdict ({release}), the Electronic Dictionary Research and Development Group's dictionary, used under its licence (CC BY-SA 4.0).",
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
    pageNew: "新しい単語",
    pageCredits: "単語の出どころ",
    letters: "{n}文字",
    kana: "{n}かな",
    loading: "単語を読み込んでいます…",
    ready: "{n}文字の単語を当ててください。入力して Enter を押します。",
    readyKana: "{n}かなの単語を当ててください。ローマ字で入力して Enter を押します。",
    notWord: "その単語はリストにありません。",
    tooShort: "文字が足りません。",
    won: "{n}回で正解！ {score}点。",
    lost: "残念、正解は {word} でした。{score}点。",
    enter: "決定",
    back: "削除",
    small: "小",
    mark: "゛゜",
    legendLetters: "緑: 場所が合っています。橙: 単語のほかの場所にあります。灰: 含まれません。",
    legendKana: "緑: 場所が合っています（大きさや濁点が違うときは矢印つき）。橙: ほかの場所にあります。黄: 同じ行のかなです。灰: どれでもありません。",
    mark_hit: "場所が合っている",
    mark_near: "単語のほかの場所にある",
    mark_miss: "含まれない",
    mark_kin: "かな表の同じ行",
    arrow_size: "大きさが違う",
    arrow_tone: "濁点などが違う",
    empty: "空",
    row: "{n}回目",
    creditLetters: "単語リストは公開辞書から作り、人名・ブランド名・字幕のノイズを取り除いています。出どころとライセンスは各パッケージの README に書いてあります。",
    creditKana: "日本語の単語は JMdict（{release}）から。電子辞書研究開発グループの辞書で、そのライセンス（CC BY-SA 4.0）のもとで使っています。",
    foot: "MITライセンスのオープンソースです。ここでは何も保存せず、どこにも送りません。",
  },
};

const KINDS = { en: "words-en", fr: "words-fr", de: "words-de" };
const DATA_NAMES = { en: "EN_WORDS", fr: "FR_WORDS", de: "DE_WORDS" };
const asked = new URLSearchParams(location.search);

const state = {
  lang: ["en", "fr", "de", "ja"].includes(asked.get("words")) ? asked.get("words") : "en",
  size: 5,
  easy: false,
  lists: null,
  hidden: "",
  guesses: [],
  kana: [],
  pending: "",
  letters: "",
  over: false,
  started: 0,
  message: "",
  loadingNow: false,
};
if (state.lang === "ja") state.size = 4;
const isKana = () => state.lang === "ja";

// A test may look at the state and draw again: only where the page is told it is under test.
if (window.kotobaTest === true) window.kotobaState = state;

const language = familyLanguage({ id: "kotoba", words: WORDS, onChange: () => render() });
const t = (key, values = {}) => language.word(key).replace(/\{(\w+)\}/g, (whole, name) => (name in values ? String(values[name]) : whole));

/** A seeded stream: the same seed picks the same word. */
function stream(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

async function load() {
  state.loadingNow = true;
  state.lists = null;
  render();
  const lang = state.lang;
  const size = state.size;
  let lists;
  if (lang === "ja") {
    const module = await import(`./dist/lists/kana-${size}.data.js`);
    lists = unpack(module[`JA_WORDS_${size}`], size);
  } else {
    const module = await import(`./dist/lists/${KINDS[lang]}.data.js`);
    lists = readWordLists(module[DATA_NAMES[lang]], size);
  }
  if (lang !== state.lang || size !== state.size) return;
  state.lists = lists;
  state.loadingNow = false;
  fresh();
}

function fresh() {
  const pool = state.easy && state.lists.easy.length > 0 ? state.lists.easy : state.lists.answers;
  const seed = /^\d{1,10}$/.test(asked.get("seed") ?? "") ? Number(asked.get("seed")) : Math.floor(Math.random() * 4294967295);
  const pick = stream(seed)();
  state.hidden = pool[Math.floor(pick * pool.length)];
  // A seed in the address picks the first word only: a new word after it is a different one.
  asked.delete("seed");
  state.guesses = [];
  state.kana = [];
  state.pending = "";
  state.letters = "";
  state.over = false;
  state.started = 0;
  state.message = "";
  render();
}

const hiddenKana = () => [...state.hidden];
const current = () => (isKana() ? state.kana : [...state.letters]);

function typeKey(key) {
  if (state.over || state.lists === null) return;
  if (state.started === 0) state.started = Date.now();
  state.message = "";
  if (isKana()) {
    if (state.kana.length >= state.size) return;
    state.pending += key;
    const read = readRomaji(state.pending);
    state.kana.push(...read.kana);
    state.pending = read.rest;
    state.kana = state.kana.slice(0, state.size);
  } else if (state.letters.length < state.size) state.letters += key;
  render();
}

function erase() {
  if (state.over) return;
  state.message = "";
  if (isKana()) {
    if (state.pending !== "") state.pending = state.pending.slice(0, -1);
    else state.kana.pop();
  } else state.letters = state.letters.slice(0, -1);
  render();
}

function submit() {
  if (state.over || state.lists === null) return;
  if (isKana()) {
    state.kana.push(...finishRomaji(state.pending));
    state.pending = "";
  }
  state.kana = state.kana.slice(0, state.size);
  const word = isKana() ? state.kana.join("") : state.letters;
  if ((isKana() ? state.kana.length : state.letters.length) < state.size) {
    state.message = t("tooShort");
    return render();
  }
  if (!state.lists.allowed.has(word) && !state.lists.answers.includes(word)) {
    state.message = t("notWord");
    return render();
  }
  state.guesses.push(word);
  state.kana = [];
  state.letters = "";
  const found = isKana() ? kanaFound([...word], hiddenKana()) : word === state.hidden;
  if (found || state.guesses.length >= ROWS) {
    state.over = true;
    const elapsed = Date.now() - state.started;
    const score = (isKana() ? kanaScore(state.hidden, state.guesses, ROWS, elapsed) : wordScore(state.hidden, state.guesses, ROWS, elapsed)).total;
    state.message = found ? t("won", { n: state.guesses.length, score }) : t("lost", { word: state.hidden, score });
  }
  render();
}

/** One guess marked, as a list of { mark, size, tone } for each place. */
function marksOf(guess) {
  if (isKana()) return markKanaGuess([...guess], hiddenKana()).map((one) => ({ mark: one.mark, size: one.wrongSize, tone: one.wrongMark }));
  return markGuess(guess, state.hidden).map((mark) => ({ mark, size: false, tone: false }));
}

function render() {
  $("status").textContent = state.loadingNow || state.lists === null ? t("loading") : state.message !== "" ? state.message : state.over ? "" : t(isKana() ? "readyKana" : "ready", { n: state.size });

  // The board: six rows of the word's length, the guesses marked, the row being typed, and empty places.
  const grid = $("grid");
  grid.style.setProperty("--size", String(state.size));
  const rows = [];
  for (let row = 0; row < ROWS; row += 1) {
    const line = document.createElement("div");
    line.className = "row";
    line.setAttribute("role", "group");
    line.setAttribute("aria-label", t("row", { n: row + 1 }));
    const guess = state.guesses[row];
    const typing = row === state.guesses.length && !state.over;
    const shown = guess !== undefined ? [...guess] : typing ? current() : [];
    const marks = guess !== undefined ? marksOf(guess) : [];
    for (let place = 0; place < state.size; place += 1) {
      const cell = document.createElement("span");
      cell.className = "cell";
      const letter = shown[place] ?? "";
      cell.textContent = letter.toUpperCase();
      cell.dataset.mark = marks[place]?.mark ?? (letter === "" ? "empty" : "typed");
      const parts = [letter === "" ? t("empty") : letter, marks[place] === undefined ? "" : t(`mark_${marks[place].mark}`)];
      if (marks[place]?.size) {
        cell.dataset.size = "wrong";
        parts.push(t("arrow_size"));
      }
      if (marks[place]?.tone) {
        cell.dataset.tone = "wrong";
        parts.push(t("arrow_tone"));
      }
      cell.setAttribute("role", "img");
      cell.setAttribute("aria-label", parts.filter(Boolean).join(", "));
      if (typing && place === shown.length && isKana() && state.pending !== "") cell.dataset.pending = state.pending;
      line.append(cell);
    }
    rows.push(line);
  }
  grid.replaceChildren(...rows);

  // The keys: a keyboard under the grid, with Enter and Delete, and for kana the two keys that change a kana.
  const keys = [];
  const rowsOfKeys = isKana() ? KEYBOARD_ROWS.en : KEYBOARD_ROWS[state.lang];
  const used = new Map();
  if (!isKana()) {
    state.guesses.forEach((guess) => marksOf(guess).forEach((one, place) => {
      const letter = guess[place];
      const rank = { hit: 3, near: 2, miss: 1 };
      if ((rank[one.mark] ?? 0) > (rank[used.get(letter)] ?? 0)) used.set(letter, one.mark);
    }));
  }
  const key = (label, action, extra = {}) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "key";
    button.textContent = label;
    for (const [name, value] of Object.entries(extra)) button.dataset[name] = value;
    // A key never takes the focus, so the keyboard of the device still types and Enter still sends.
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", action);
    return button;
  };
  rowsOfKeys.forEach((letters, index) => {
    const line = document.createElement("div");
    line.className = "key-row";
    if (index === rowsOfKeys.length - 1) line.append(key(t("enter"), submit, { wide: "true", act: "enter" }));
    for (const letter of letters) line.append(key(letter.toUpperCase(), () => typeKey(letter), { letter, mark: used.get(letter) ?? "" }));
    if (index === rowsOfKeys.length - 1) line.append(key(t("back"), erase, { wide: "true", act: "back" }));
    keys.push(line);
  });
  if (isKana()) {
    const extra = document.createElement("div");
    extra.className = "key-row";
    extra.append(
      key("-", () => typeKey("-"), { letter: "-" }),
      key(t("small"), () => {
        if (state.kana.length > 0 && !state.over) {
          state.kana[state.kana.length - 1] = toggleSize(state.kana[state.kana.length - 1]);
          render();
        }
      }, { act: "small" }),
      key(t("mark"), () => {
        if (state.kana.length > 0 && !state.over) {
          state.kana[state.kana.length - 1] = cycleMark(state.kana[state.kana.length - 1]);
          render();
        }
      }, { act: "mark" }),
    );
    keys.push(extra);
  }
  $("keys").replaceChildren(...keys);
  $("legend").textContent = t(isKana() ? "legendKana" : "legendLetters");
  $("credit").textContent = t(isKana() ? "creditKana" : "creditLetters", { release: state.lists?.release ?? "" });

  // The length choices for this language, and the buttons' state.
  const sizes = isKana() ? [3, 4, 5] : [4, 5, 6];
  if ($("sizes").children.length !== sizes.length || $("sizes").dataset.lang !== state.lang) {
    $("sizes").dataset.lang = state.lang;
    $("sizes").replaceChildren(
      ...sizes.map((size) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.size = String(size);
        button.addEventListener("click", (event) => {
          letGo(event);
          state.size = size;
          load();
        });
        return button;
      }),
    );
  }
  for (const button of $("sizes").children) {
    button.textContent = t(isKana() ? "kana" : "letters", { n: button.dataset.size });
    button.setAttribute("aria-pressed", String(Number(button.dataset.size) === state.size));
  }
  for (const button of $("languages").children) button.setAttribute("aria-pressed", String(button.dataset.langId === state.lang));
  $("easy").setAttribute("aria-pressed", String(state.easy));
}

/** A button clicked or tapped lets go of the focus, so that Enter goes on sending the guess; one pressed from the keyboard keeps it. */
const letGo = (event) => {
  if (event.detail > 0) event.currentTarget.blur();
};
for (const button of $("languages").children) {
  button.addEventListener("click", (event) => {
    letGo(event);
    state.lang = button.dataset.langId;
    state.size = state.lang === "ja" ? 4 : 5;
    load();
  });
}
$("easy").addEventListener("click", (event) => {
  letGo(event);
  state.easy = !state.easy;
  if (state.lists !== null) fresh();
  else render();
});
$("new").addEventListener("click", (event) => {
  letGo(event);
  if (state.lists !== null) fresh();
});

// The keyboard of the device does what the one on the page does.
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  // Enter on a control that has the focus presses that control (a control clicked or tapped lets go of the focus, below), so Enter sends the guess.
  if (target instanceof HTMLElement && target.closest("button, select, input, textarea") !== null && event.key === "Enter") return;
  if (event.key === "Enter") {
    event.preventDefault();
    submit();
  } else if (event.key === "Backspace") {
    // Some browsers take Backspace as "go back a page".
    event.preventDefault();
    erase();
  }
  else if (event.key.length === 1) {
    const letter = event.key.toLowerCase();
    const allowed = isKana() ? /^[a-z-]$/ : new RegExp(`^[${[...KEYBOARD_ROWS[state.lang]].join("")}]$`);
    if (allowed.test(letter)) typeKey(letter);
  }
});

load().then(() => {
  document.documentElement.dataset.ready = "true";
});
