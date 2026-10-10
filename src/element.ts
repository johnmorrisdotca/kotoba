import { mountKotoba, KOTOBA_PLAY_CSS, type KotobaPlay, type KotobaPlayOptions, type KotobaNewGame } from "./play.ts";
import { WORD_LIST_NAMES, WORD_LIST_SIZES, type WordListName } from "./load.ts";
import { embedDay } from "./embed-day.ts";
import type { WordGame } from "./game.ts";
import type { Language } from "./strings.ts";
const ElementBase = typeof HTMLElement === "undefined" ? class {} as typeof HTMLElement : HTMLElement;
const isOn = (value: string | null, fallback = true): boolean => value === null ? fallback : !["off", "false", "no", "0"].includes(value.trim().toLowerCase());
/** Real mounted options, checked alongside builder coverage. */
export const KOTOBA_EMBED_OPTION_KEYS = Object.keys({ words: true, size: true, easy: true, rows: true, seed: true, daily: true, hidden: true, locale: true, strings: true, theme: true, keyboard: true, keyboardTarget: true, onFinish: true, onChange: true, load: true, now: true } satisfies Record<keyof KotobaPlayOptions, boolean>);
/** Host data, appearance overrides, loading and callbacks; attributes override round choices. */
export type KotobaElementOptions = KotobaPlayOptions;
/** A word game with scoped keyboard handling, reflected choices and UTC daily play. */
export class KotobaGame extends ElementBase {
  static observedAttributes = ["words", "letters", "rows", "easy", "seed", "daily", "keyboard", "lang", "size", "width", "theme", "label"];
  #mount: KotobaPlay | null = null;
  #key = "";
  #revision = 0;
  #options: KotobaElementOptions = {};
  #widthBefore: string | null = null;
  #widthOwned = false;
  #labelBefore: { role: string | null; label: string | null } | null = null;
  #write(name: string, value: unknown): void { if (value === null || value === undefined) this.removeAttribute(name); else this.setAttribute(name, String(value)); }
  /** Host options. Callback and language changes preserve the current round. */
  get options(): KotobaElementOptions { return this.#options; }
  set options(value: KotobaElementOptions) { const reset = value?.load !== this.#options.load || value?.now !== this.#options.now || value?.strings !== this.#options.strings || value?.theme !== this.#options.theme; this.#options = value ?? {}; if (reset) this.#key = ""; if (this.isConnected) this.#refresh(); }
  connectedCallback(): void { if (!this.hasAttribute("tabindex")) this.tabIndex = 0; this.#refresh(); }
  disconnectedCallback(): void { ++this.#revision; this.#mount?.destroy(); this.#mount = null; this.#key = ""; }
  attributeChangedCallback(): void { if (this.isConnected) this.#refresh(); }
  /** The current structured round, including its hidden word; keep it within trusted host code. */
  get game(): WordGame | null { return this.#mount?.game ?? null; }
  /** The mounted play handle, including ready and newGame. */
  get player(): KotobaPlay | null { return this.#mount; }
  /** Starts a round using the native mount API. */
  async newGame(next: KotobaNewGame = {}): Promise<void> { await this.#mount?.newGame(next); }
  /** The `words` attribute, reflected. */
  get words(): string | null { return this.getAttribute("words"); }
  set words(value: string | number | boolean | null | undefined) { this.#write("words", value); }
  /** The `letters` attribute, reflected. */
  get letters(): string | null { return this.getAttribute("letters"); }
  set letters(value: string | number | boolean | null | undefined) { this.#write("letters", value); }
  /** The `rows` attribute, reflected. */
  get rows(): string | null { return this.getAttribute("rows"); }
  set rows(value: string | number | boolean | null | undefined) { this.#write("rows", value); }
  /** The `easy` attribute, reflected. */
  get easy(): string | null { return this.getAttribute("easy"); }
  set easy(value: string | number | boolean | null | undefined) { this.#write("easy", value); }
  /** The `seed` attribute, reflected. */
  get seed(): string | null { return this.getAttribute("seed"); }
  set seed(value: string | number | boolean | null | undefined) { this.#write("seed", value); }
  /** The `daily` attribute, reflected. */
  get daily(): string | null { return this.getAttribute("daily"); }
  set daily(value: string | number | boolean | null | undefined) { this.#write("daily", value); }
  /** The `keyboard` attribute, reflected. */
  get keyboard(): string | null { return this.getAttribute("keyboard"); }
  set keyboard(value: string | number | boolean | null | undefined) { this.#write("keyboard", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { this.#write("size", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { this.#write("width", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { this.#write("theme", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { this.#write("label", value); }
  #frame(): void {
    this.style.display = "block"; this.style.maxWidth = "100%";
    const width = Number(this.getAttribute("width")), size = this.getAttribute("size");
    const pixels = this.hasAttribute("width") && width > 0 && Number.isFinite(width) ? Math.min(width, 2000) : size === "small" ? 320 : size === "medium" ? 480 : size === "large" ? 640 : null;
    if (pixels !== null) { if (!this.#widthOwned) this.#widthBefore = this.style.width; this.#widthOwned = true; this.style.width = `${pixels}px`; }
    else if (this.#widthOwned) { this.style.width = this.#widthBefore ?? ""; this.#widthOwned = false; }
    const theme = this.getAttribute("theme"); this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
    this.setAttribute("data-kotoba-embed", "");
    const root = this.getRootNode(), target: ParentNode = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : this.ownerDocument.head;
    if (target.querySelector("style[data-kotoba-embed-style]") === null) {
      const style = this.ownerDocument.createElement("style"); style.setAttribute("data-kotoba-embed-style", "");
      const dark = '[data-kotoba-embed] .kt-root{--kt-board:#202823;--kt-ink:#f3efe4;--kt-cell:#455349;--kt-cell-ink:#f3efe4}';
      style.textContent = KOTOBA_PLAY_CSS + dark.replaceAll('[data-kotoba-embed]', '[data-kotoba-embed][theme="dark"]') + '@media(prefers-color-scheme:dark){' + dark.replaceAll('[data-kotoba-embed]', '[data-kotoba-embed]:not([theme="light"]):not([theme="dark"])') + '}';
 target.append(style);
    }
    if (this.hasAttribute("label")) { this.#labelBefore ??= { role: this.getAttribute("role"), label: this.getAttribute("aria-label") }; this.setAttribute("role", "group"); this.setAttribute("aria-label", this.getAttribute("label")!); }
    else if (this.#labelBefore !== null) { for (const [name, value] of [["role", this.#labelBefore.role], ["aria-label", this.#labelBefore.label]]) { if (value === null) this.removeAttribute(name!); else this.setAttribute(name!, value!); } this.#labelBefore = null; }
  }
  #problem(error: unknown): void {
    this.#mount?.destroy(); this.#mount = null; this.#key = "";
    const message = error instanceof Error ? error.message : String(error), status = this.ownerDocument.createElement("p"); status.setAttribute("role", "status"); status.textContent = message; this.replaceChildren(status);
    this.dispatchEvent(new CustomEvent("kotoba-error", { bubbles: true, composed: true, detail: { message } }));
  }
  #refresh(): void {
    this.#frame();
    try {
      const words = (this.getAttribute("words") ?? this.#options.words ?? "en") as WordListName;
      const n = (name: string, fallback: number): number => this.hasAttribute(name) ? Number(this.getAttribute(name)) : fallback;
      const letters = n("letters", this.#options.size ?? (words === "ja" ? 4 : 5)), rows = n("rows", this.#options.rows ?? 6);
      if (!WORD_LIST_NAMES.includes(words) || !WORD_LIST_SIZES[words].includes(letters) || !Number.isInteger(rows) || rows < 1 || rows > 12) throw new RangeError("Choose a supported word list, word length and 1–12 guesses.");
      const seed = this.hasAttribute("seed") ? n("seed", 1) : this.#options.seed;
      if (seed !== undefined && (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)) throw new RangeError("Use a whole seed from 0 to 4294967295.");
      const day = embedDay(this.getAttribute("daily") ?? (this.#options.daily === true ? "today" : this.#options.daily === false ? "off" : this.#options.daily));
      const round = { words, size: letters, rows, seed, daily: day ?? false, easy: isOn(this.getAttribute("easy"), this.#options.easy ?? false), hidden: this.#options.hidden };
      const key = JSON.stringify([round, isOn(this.getAttribute("keyboard"), this.#options.keyboard ?? true)]), locale = (this.getAttribute("lang") ?? this.#options.locale ?? (this.ownerDocument.documentElement.lang === "ja" ? "ja" : "en")) as Language;
      if (key === this.#key && this.#mount !== null) { this.#mount.setLocale(locale); return; }
      this.#mount?.destroy(); this.#mount = null; this.replaceChildren(); const revision = ++this.#revision;
      const mounted = mountKotoba(this, { ...this.#options, ...round, locale, keyboard: isOn(this.getAttribute("keyboard"), this.#options.keyboard ?? true), keyboardTarget: this, onChange: game => this.#options.onChange?.(game), onFinish: game => this.#options.onFinish?.(game) });
      this.#mount = mounted; this.#key = key;
      void mounted.ready.then(() => { if (this.isConnected && revision === this.#revision) this.dispatchEvent(new CustomEvent("kotoba-load", { bubbles: true, composed: true, detail: { words, letters, rows, day } })); }).catch((error: unknown) => { if (this.isConnected && revision === this.#revision) this.#problem(error); });
    } catch (error) { ++this.#revision; this.#problem(error); }
  }
}
/** Defines the default game or a subclass under a custom tag. Safe on a server. */
export function defineGame(tagName = "kotoba-game", registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void {
  if (registry !== undefined && registry.get(tagName) === undefined) registry.define(tagName, tagName === "kotoba-game" ? KotobaGame : class extends KotobaGame {});
}
