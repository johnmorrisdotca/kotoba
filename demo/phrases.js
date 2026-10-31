// The demo's two panels below the game: a word chain against the computer, and the idioms. Both lists are fetched only
// when somebody reaches for them. The rules and the lists are the package's; this page only shows them.
import {
  finishRomaji,
  normalizeShiritoriReading,
  playShiritori,
  readIdioms,
  readShiritoriWords,
  searchIdioms,
  shiritoriChoices,
  shiritoriTailKey,
} from "./dist/index.js";

const $ = (id) => document.getElementById(id);
const SHOWN_IDIOMS = 6;
/** The computer answers from this many of the commonest choices, so the chain stays words people know. */
const COMPUTER_CHOOSES_FROM = 40;

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function row(head, reading, ...notes) {
  const item = document.createElement("li");
  const title = document.createElement("div");
  title.className = "phrase-head";
  title.lang = "ja";
  title.textContent = head;
  if (reading !== head) {
    const small = document.createElement("span");
    small.textContent = reading;
    title.append(small);
  }
  item.append(title);
  for (const note of notes) {
    const line = document.createElement("div");
    line.className = "phrase-note";
    line.textContent = note;
    item.append(line);
  }
  return item;
}

/** @param {{ t: (key: string, values?: object) => string }} words */
export function mountPhrases({ t }) {
  let words = null;
  let release = "";
  let chain = [];
  let status = null;
  let idioms = null;
  let shownIdiom = null;

  /** Kana as typed, or romaji read into kana. */
  const reading = (typed) => {
    const text = typed.trim();
    return /[a-zA-Z]/.test(text) ? finishRomaji(text.toLowerCase()).join("") : text;
  };

  function draw() {
    $("chain-list").replaceChildren(...chain.map((word) => row(word.word, word.reading, word.meaning)));
    $("chain-status").textContent = status === null ? "" : t(status.key, status.values);
    const over = chain.length > 0 && status !== null && (status.key === "chainLost" || status.key === "chainWon");
    $("chain-input").disabled = over;
    $("chain-say").disabled = over;
    $("phrases-credit").textContent = release === "" ? "" : t("phrasesCredit", { release });
    drawIdioms();
  }

  function drawIdioms() {
    if (idioms === null) return;
    const text = $("idiom-search").value;
    const found = text.trim() === "" ? (shownIdiom === null ? [] : [shownIdiom]) : searchIdioms(idioms, text);
    $("idiom-count").textContent =
      text.trim() === ""
        ? ""
        : found.length === 0
          ? t("idiomNone")
          : t("idiomFound", { n: found.length, all: idioms.length });
    $("idiom-list").replaceChildren(
      ...found
        .slice(0, SHOWN_IDIOMS)
        .map((one) =>
          row(
            one.idiom,
            one.reading,
            one.meanings.join("; "),
            t(one.kind === "idiom" ? "idiomKindIdiom" : "idiomKindExpression"),
          ),
        ),
    );
  }

  async function startChain() {
    if (words === null) {
      const { JA_SHIRITORI } = await import("./dist/lists/shiritori-ja.data.js");
      words = readShiritoriWords(JA_SHIRITORI);
      release = JA_SHIRITORI.release;
    }
    const first = pick(shiritoriChoices(words, []).slice(0, COMPUTER_CHOOSES_FROM));
    chain = [first];
    status = { key: "chainStart", values: { word: first.word, key: shiritoriTailKey(first.reading) } };
    $("chain-input").value = "";
    draw();
  }

  async function loadIdiomsOnce() {
    if (idioms !== null) return;
    const { JA_IDIOMS } = await import("./dist/lists/idioms-ja.data.js");
    idioms = readIdioms(JA_IDIOMS);
    release = JA_IDIOMS.release;
    shownIdiom = pick(idioms.filter((one) => one.elementary));
  }

  function say(event) {
    event.preventDefault();
    if (words === null) return;
    const said = reading($("chain-input").value);
    const played = chain.map((word) => word.reading);
    const key = shiritoriTailKey(played.at(-1));
    const judged = playShiritori(played, said);
    if (!judged.ok) {
      const refusal = { "not-kana": "chainNotKana", "wrong-start": "chainWrongStart", repeated: "chainRepeated" };
      status = { key: refusal[judged.why], values: { key } };
      draw();
      return;
    }
    const folded = normalizeShiritoriReading(said);
    const known = words.find((one) => normalizeShiritoriReading(one.reading) === folded);
    if (known === undefined) {
      status = { key: "chainNotWord", values: {} };
      draw();
      return;
    }
    chain.push(known);
    $("chain-input").value = "";
    if (judged.loses) {
      status = { key: "chainLost", values: { n: chain.length } };
      draw();
      return;
    }
    const choices = shiritoriChoices(
      words,
      chain.map((one) => one.reading),
    );
    if (choices.length === 0) {
      status = { key: "chainWon", values: { key: judged.next, n: chain.length } };
      draw();
      return;
    }
    const answer = pick(choices.slice(0, COMPUTER_CHOOSES_FROM));
    chain.push(answer);
    status = { key: "chainYour", values: { word: answer.word, key: shiritoriTailKey(answer.reading) } };
    draw();
  }

  $("chain-form").addEventListener("submit", say);
  $("chain-new").addEventListener("click", () => void startChain());
  $("idiom-search").addEventListener("input", () => void loadIdiomsOnce().then(draw));
  $("idiom-another").addEventListener("click", () => {
    void loadIdiomsOnce().then(() => {
      shownIdiom = pick(idioms.filter((one) => one.elementary));
      $("idiom-search").value = "";
      draw();
    });
  });

  // Fetch each list when its panel comes near the screen, not when the page opens.
  const near = (id, load) => {
    const watcher = new IntersectionObserver(
      (seen) => {
        if (!seen.some((one) => one.isIntersecting)) return;
        watcher.disconnect();
        void load();
      },
      { rootMargin: "300px" },
    );
    watcher.observe($(id));
  };
  near("chain-title", startChain);
  near("idiom-title", () => loadIdiomsOnce().then(draw));

  return { draw };
}
