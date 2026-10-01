import { dailyWord, dayKey } from "./daily.ts";
import { WORD_GAME_ROWS, changeWordGame, eraseWordGame, guessMarks, keyMarks, startWordGame, submitWordGame, typeWordGame, wordGameKeys, type WordGame, type WordGameRefusal } from "./game.ts";
import { KEYBOARD_ROWS } from "./keyboardRows.ts";
import { loadWordList, type LoadedWordList, type WordListName } from "./load.ts";
import { KOTOBA_STRINGS, kotobaSay, type KotobaStrings, type Language } from "./strings.ts";

/**
 * A WORD GAME YOU CAN PUT ON A PAGE: a board of guesses, the keyboard of the
 * language under it, and the legend of the marks, drawn into one element and
 * played by touch or by the device's keyboard. It is `game.ts` (the rules of a
 * round) and `load.ts` (the lists) with a face on them; nothing here decides
 * anything the rules do not.
 *
 * ```ts
 * import { mountKotoba } from "@johnmorrisdotca/kotoba/play";
 *
 * const play = mountKotoba(document.getElementById("game")!, { words: "en", size: 5, daily: true });
 * await play.ready;
 * ```
 *
 * It draws plain elements with `kt-` classes and a stylesheet it adds to the
 * page once; every colour and size is a CSS variable (see `KOTOBA_PLAY_CSS`).
 * Setting up (which language, how long, easy words) is yours: call `newGame`.
 */

/** What a round is dealt from, and how the game looks and behaves. Every field may be left out. */
export type KotobaPlayOptions = {
  /** The list: English, French, German or Japanese kana. Unless said, English. */
  words?: WordListName;
  /** Letters, or kana, in the word. Unless said, five, or four kana. */
  size?: number;
  /** Hide only one of the easy answers. Unless said, any answer. */
  easy?: boolean;
  /** How many guesses the round gives. Unless said, six. */
  rows?: number;
  /** A seed: the same seed picks the same word from the same list. Unless said, one is drawn. */
  seed?: number;
  /** The word of the day (`dailyWord`) instead of a random one: `true` for today in UTC, or a day written `YYYY-MM-DD`. Wins over `seed`. */
  daily?: boolean | string;
  /** The word to find, whatever the lists say: a friend's, or one from your own source. Wins over `daily` and `seed`. */
  hidden?: string;
  /** The language of the game's own words: the prompts, the keys and the legend. Unless said, English. */
  locale?: Language;
  /** Words of your own, over `locale`'s: any of `KOTOBA_STRINGS`' names. */
  strings?: Partial<KotobaStrings>;
  /** CSS variables set on the game: `{ "--kt-hit": "#1a7f37" }`. */
  theme?: Record<string, string>;
  /** Take the device's keyboard (letters, Enter, Backspace) as the keys on the screen. Unless said, yes. */
  keyboard?: boolean;
  /** Called once when a round ends, with the round: its guesses and its score. */
  onFinish?: (game: WordGame) => void;
  /** Called after every change of the round, and with null while a list is loading. */
  onChange?: (game: WordGame | null) => void;
  /** Where a list comes from. Unless said, `loadWordList`: the package's own modules. */
  load?: (words: WordListName, size: number) => Promise<LoadedWordList | null>;
  /** The time in milliseconds, for the clock a score reads. Unless said, `Date.now`. */
  now?: () => number;
};

/** What `newGame` may change: the choices about the word, and nothing about the look. */
export type KotobaNewGame = Pick<KotobaPlayOptions, "words" | "size" | "easy" | "rows" | "seed" | "daily" | "hidden">;

/** A mounted game. */
export type KotobaPlay = {
  /** The round being played, or null while a list is loading. */
  readonly game: WordGame | null;
  /** Settles once the first round is dealt (or the list could not be had). */
  readonly ready: Promise<void>;
  /** Deal a new round, changing the choices given and keeping the rest. Settles once it is dealt. */
  newGame(next?: KotobaNewGame): Promise<void>;
  /** Change the language of the game's own words, at once. */
  setLocale(locale: Language): void;
  /** Take the game off the page and stop listening to the keyboard. */
  destroy(): void;
};

/** The variables the game's look is made of, with what they are unless set. The stylesheet the game adds to a page is `KOTOBA_PLAY_CSS`. */
export const KOTOBA_PLAY_VARIABLES = {
  "--kt-board": "#2f5d4a",
  "--kt-ink": "#f3efe4",
  "--kt-cell": "#fbf8ee",
  "--kt-cell-ink": "#1b1b1b",
  "--kt-hit": "#2f7a4f",
  "--kt-near": "#d9822b",
  "--kt-kin": "#d9b83b",
  "--kt-miss": "#5a5f5a",
  "--kt-typed": "#e0b43b",
  "--kt-radius": "14px",
  "--kt-cell-size": "60px",
} as const;

/** The game's stylesheet: added to the page once, as a `<style>` with the id `kotoba-play-style`. */
export const KOTOBA_PLAY_CSS = `.kt-root { ${Object.entries(KOTOBA_PLAY_VARIABLES).map(([name, value]) => `${name}: ${value};`).join(" ")} box-sizing: border-box; display: grid; gap: 12px; padding: 14px; justify-items: center; background: var(--kt-board); color: var(--kt-ink); border-radius: var(--kt-radius); font-family: system-ui, sans-serif; }
.kt-root *, .kt-root *::before, .kt-root *::after { box-sizing: border-box; }
.kt-status { margin: 0; min-height: 2.8em; font-weight: 700; text-align: center; }
.kt-legend { margin: 0; font-size: .8rem; opacity: .9; text-align: center; min-height: 3.4em; max-width: 46ch; }
.kt-grid { --size: 5; display: grid; gap: 6px; width: min(100%, calc(var(--size) * var(--kt-cell-size))); }
.kt-row { display: grid; grid-template-columns: repeat(var(--size), minmax(0, 1fr)); gap: 6px; }
.kt-cell { position: relative; aspect-ratio: 1; display: grid; place-items: center; border-radius: 8px; background: var(--kt-cell); color: var(--kt-cell-ink); border: 2px solid rgba(0,0,0,.25); font-weight: 800; font-size: clamp(1.1rem, 6vw, 1.7rem); user-select: none; -webkit-user-select: none; }
.kt-cell[data-mark="empty"] { background: rgba(0,0,0,.18); border-color: rgba(255,255,255,.18); }
.kt-cell[data-mark="typed"] { border-color: var(--kt-typed); }
.kt-cell[data-mark="hit"] { background: var(--kt-hit); color: #fff; border-color: transparent; }
.kt-cell[data-mark="near"] { background: var(--kt-near); color: #fff; border-color: transparent; }
.kt-cell[data-mark="kin"] { background: var(--kt-kin); color: #1b1b1b; border-color: transparent; }
.kt-cell[data-mark="miss"] { background: var(--kt-miss); color: #fff; border-color: transparent; }
.kt-cell[data-mark="hit"]::after { content: "●"; }
.kt-cell[data-mark="near"]::after { content: "◐"; }
.kt-cell[data-mark="kin"]::after { content: "≈"; }
.kt-cell[data-mark="miss"]::after { content: "○"; }
.kt-cell[data-mark="hit"]::after, .kt-cell[data-mark="near"]::after, .kt-cell[data-mark="kin"]::after, .kt-cell[data-mark="miss"]::after { position: absolute; top: 2px; right: 5px; font-size: .55rem; font-weight: 700; opacity: .8; }
.kt-cell[data-size="wrong"]::before { content: "↓"; position: absolute; left: 4px; bottom: 1px; font-size: .7rem; }
.kt-cell[data-tone="wrong"]::before { content: "↑"; position: absolute; left: 4px; bottom: 1px; font-size: .7rem; }
.kt-cell[data-pending]::before { content: attr(data-pending); position: absolute; left: 4px; bottom: 1px; font-size: .6rem; opacity: .7; }
.kt-keys { display: grid; gap: 6px; width: min(100%, 520px); }
.kt-key-row { display: flex; justify-content: center; gap: 4px; }
.kt-key { flex: 1 1 0; min-width: 0; max-width: 46px; min-height: 48px; padding: 0; border-radius: 8px; border: 1px solid rgba(0,0,0,.3); background: var(--kt-cell); color: var(--kt-cell-ink); font: inherit; font-weight: 700; font-size: .95rem; text-transform: uppercase; user-select: none; -webkit-user-select: none; cursor: pointer; }
.kt-key[data-wide="true"] { flex: 1.6 1 0; max-width: 78px; font-size: .75rem; text-transform: none; }
.kt-key[data-mark="hit"] { background: var(--kt-hit); color: #fff; }
.kt-key[data-mark="near"] { background: var(--kt-near); color: #fff; }
.kt-key[data-mark="miss"] { background: var(--kt-miss); color: #fff; opacity: .7; }
.kt-key[data-act="small"], .kt-key[data-act="mark"] { max-width: 78px; flex: 1.6 1 0; font-size: 1.1rem; text-transform: none; }
`;

/** A seeded stream: the same seed picks the same word. */
function stream(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** What the status line says, kept as a name and its values so that a change of language says it again. */
type Message = { key: keyof KotobaStrings; values?: Record<string, string | number> } | null;

/** Put a word game into `container`, and deal the first round. */
export function mountKotoba(container: HTMLElement, options: KotobaPlayOptions = {}): KotobaPlay {
  const doc = container.ownerDocument;
  const load = options.load ?? loadWordList;
  const now = options.now ?? Date.now;
  let locale: Language = options.locale ?? "en";
  const own = options.strings ?? {};
  const say = (key: keyof KotobaStrings, values: Record<string, string | number> = {}) => kotobaSay(own[key] ?? KOTOBA_STRINGS[locale][key], values);

  // The choices about the word: kept between rounds, changed by `newGame`.
  const choice = { words: options.words ?? ("en" as WordListName), size: options.size ?? (options.words === "ja" ? 4 : 5), easy: options.easy === true, rows: options.rows ?? WORD_GAME_ROWS };
  let list: LoadedWordList | null = null;
  let game: WordGame | null = null;
  let message: Message = null;
  let told = false;
  let token = 0;
  let destroyed = false;

  if (doc.getElementById("kotoba-play-style") === null) {
    const style = doc.createElement("style");
    style.id = "kotoba-play-style";
    style.textContent = KOTOBA_PLAY_CSS;
    doc.head.append(style);
  }
  const root = doc.createElement("div");
  root.className = "kt-root";
  root.dataset.kotoba = "";
  for (const [name, value] of Object.entries(options.theme ?? {})) root.style.setProperty(name, value);
  const status = doc.createElement("p");
  status.className = "kt-status";
  status.dataset.kt = "status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const grid = doc.createElement("div");
  grid.className = "kt-grid";
  grid.dataset.kt = "grid";
  const keys = doc.createElement("div");
  keys.className = "kt-keys";
  keys.dataset.kt = "keys";
  const legend = doc.createElement("p");
  legend.className = "kt-legend";
  legend.dataset.kt = "legend";
  root.append(status, grid, keys, legend);
  container.append(root);

  const changed = () => options.onChange?.(game);

  /** The round after a key, a message cleared; drawn. */
  function update(next: WordGame, because: Message = null) {
    game = next;
    message = because;
    draw();
    changed();
  }

  const refusals: Record<WordGameRefusal, keyof KotobaStrings> = { "too-short": "tooShort", "not-a-word": "notWord" };

  function type(letter: string) {
    if (game === null || list === null) return;
    update(typeWordGame(game, letter, now()));
  }
  function erase() {
    if (game !== null) update(eraseWordGame(game));
  }
  function change(what: "size" | "mark") {
    if (game !== null) update(changeWordGame(game, what));
  }
  function submit() {
    if (game === null || list === null || game.status !== "playing") return;
    const sent = submitWordGame(game, list, now());
    if (sent.refused !== null) return update(sent.game, { key: refusals[sent.refused] });
    if (sent.game.status === "playing") return update(sent.game);
    const done = sent.game;
    update(done, done.status === "won" ? { key: "won", values: { n: done.guesses.length, score: done.score?.total ?? 0 } } : { key: "lost", values: { word: done.hidden, score: done.score?.total ?? 0 } });
    if (!told) {
      told = true;
      options.onFinish?.(done);
    }
  }

  function draw() {
    const round = game;
    const kana = (round?.language ?? choice.words) === "ja";
    status.textContent = list === null || round === null ? say("loading") : message !== null ? say(message.key, message.values) : round.status !== "playing" ? "" : say(kana ? "readyKana" : "ready", { n: round.size });

    // The board: a row for every guess the round gives, the guesses marked, the row being typed, and empty places.
    const size = round?.size ?? choice.size;
    grid.style.setProperty("--size", String(size));
    const rows: HTMLElement[] = [];
    for (let row = 0; row < (round?.rows ?? choice.rows); row += 1) {
      const line = doc.createElement("div");
      line.className = "kt-row";
      line.setAttribute("role", "group");
      line.setAttribute("aria-label", say("row", { n: row + 1 }));
      const guess = round?.guesses[row];
      const typing = round !== null && row === round.guesses.length && round.status === "playing";
      const shown = guess !== undefined ? [...guess] : typing ? round.typed : [];
      const marks = guess !== undefined && round !== null ? guessMarks(round, guess) : [];
      for (let place = 0; place < size; place += 1) {
        const cell = doc.createElement("span");
        cell.className = "kt-cell";
        const letter = shown[place] ?? "";
        cell.textContent = letter.toUpperCase();
        const mark = marks[place];
        cell.dataset.mark = mark?.mark ?? (letter === "" ? "empty" : "typed");
        const markName = { hit: "markHit", near: "markNear", miss: "markMiss", kin: "markKin" } as const;
        const parts = [letter === "" ? say("empty") : letter, mark === undefined ? "" : say(markName[mark.mark])];
        if (mark?.wrongSize) {
          cell.dataset.size = "wrong";
          parts.push(say("arrowSize"));
        }
        if (mark?.wrongMark) {
          cell.dataset.tone = "wrong";
          parts.push(say("arrowTone"));
        }
        cell.setAttribute("role", "img");
        cell.setAttribute("aria-label", parts.filter(Boolean).join(", "));
        if (typing && place === shown.length && kana && round.pending !== "") cell.dataset.pending = round.pending;
        line.append(cell);
      }
      rows.push(line);
    }
    grid.replaceChildren(...rows);

    // The keys: a keyboard under the grid, with Enter and Delete, and for kana the two keys that change a kana.
    const marked = round === null ? new Map() : keyMarks(round);
    const key = (label: string, action: () => void, extra: Record<string, string> = {}) => {
      const button = doc.createElement("button");
      button.type = "button";
      button.className = "kt-key";
      button.textContent = label;
      for (const [name, value] of Object.entries(extra)) button.dataset[name] = value;
      // A key never takes the focus, so the keyboard of the device still types and Enter still sends.
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", action);
      return button;
    };
    const language = round?.language ?? choice.words;
    const rowsOfKeys = language === "ja" ? KEYBOARD_ROWS.en : KEYBOARD_ROWS[language];
    const lines = rowsOfKeys.map((letters, index) => {
      const line = doc.createElement("div");
      line.className = "kt-key-row";
      if (index === rowsOfKeys.length - 1) line.append(key(say("enter"), submit, { wide: "true", act: "enter" }));
      for (const letter of letters) line.append(key(letter.toUpperCase(), () => type(letter), { letter, mark: marked.get(letter) ?? "" }));
      if (index === rowsOfKeys.length - 1) line.append(key(say("back"), erase, { wide: "true", act: "back" }));
      return line;
    });
    if (kana) {
      const extra = doc.createElement("div");
      extra.className = "kt-key-row";
      extra.append(key("-", () => type("-"), { letter: "-" }), key(say("small"), () => change("size"), { act: "small" }), key(say("mark"), () => change("mark"), { act: "mark" }));
      lines.push(extra);
    }
    keys.replaceChildren(...lines);
    legend.textContent = say(kana ? "legendKana" : "legendLetters");
  }

  /** The device's keyboard does what the one on the page does. */
  function onKey(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey || game === null) return;
    const target = event.target;
    // Enter on a control that has the focus presses that control, so a control outside the game keeps its Enter.
    if (event.key === "Enter" && (target as Element | null)?.closest?.("button, select, input, textarea")) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Backspace") {
      // Some browsers take Backspace as "go back a page".
      event.preventDefault();
      erase();
    } else if (event.key.length === 1) {
      const letter = event.key.toLowerCase();
      if (wordGameKeys(game.language).includes(letter)) type(letter);
    }
  }
  if (options.keyboard !== false) doc.addEventListener("keydown", onKey);

  /** The word a round hides: the one given, or the day's, or a seed's, or a draw's, from the easy answers or the answers. */
  function pick(loaded: LoadedWordList, next: KotobaNewGame): string {
    if (next.hidden !== undefined) return next.hidden.toLowerCase();
    const pool = choice.easy && loaded.easy.length > 0 ? loaded.easy : loaded.answers;
    if (next.daily !== undefined && next.daily !== false) {
      const day = typeof next.daily === "string" ? next.daily : dayKey(now());
      return dailyWord(pool, day, { salt: `${choice.words}-${choice.size}-${choice.easy ? "easy" : "answers"}` });
    }
    const seed = next.seed ?? Math.floor(Math.random() * 4294967295);
    return pool[Math.floor(stream(seed)() * pool.length)] as string;
  }

  async function deal(next: KotobaNewGame): Promise<void> {
    if (next.words !== undefined) {
      choice.words = next.words;
      if (next.size === undefined) choice.size = next.words === "ja" ? 4 : 5;
    }
    if (next.size !== undefined) choice.size = next.size;
    if (next.easy !== undefined) choice.easy = next.easy;
    if (next.rows !== undefined) choice.rows = next.rows;
    const mine = (token += 1);
    list = null;
    game = null;
    message = null;
    draw();
    changed();
    const loaded = await load(choice.words, choice.size);
    // A newer round was asked for while this list was coming: that one is the one to deal.
    if (mine !== token || destroyed) return;
    if (loaded === null) throw new RangeError(`there is no list of ${choice.size} in ${choice.words}`);
    list = loaded;
    told = false;
    game = startWordGame(choice.words, choice.size, pick(loaded, next), choice.rows);
    draw();
    changed();
  }

  const first = deal({ seed: options.seed, daily: options.daily, hidden: options.hidden });
  return {
    get game() {
      return game;
    },
    ready: first,
    newGame: (next = {}) => deal(next),
    setLocale(next) {
      locale = next;
      draw();
    },
    destroy() {
      destroyed = true;
      doc.removeEventListener("keydown", onKey);
      root.remove();
    },
  };
}
