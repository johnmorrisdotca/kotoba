import type { KotobaStrings } from "./strings.ts";

/**
 * THE COLOUR GUIDE of the game: a labelled button under the keyboard and the
 * dialog it opens. Every colour is shown as the game draws it (a real cell, a
 * real key), beside its name and a sentence a child can read, so the colour is
 * never the only thing said. Kana add their yellow and their two arrows. It is
 * a native modal `<dialog>`: Escape, the close button, Got it and a press on
 * the backdrop all close it, and the focus goes back to the button.
 */

/** The guide's rules, one to a line; part of `KOTOBA_PLAY_CSS`. */
export const KOTOBA_GUIDE_CSS = [
  // The row under the keyboard keeps the measure the legend line gave the game (46 characters), so the game is as wide as it always was.
  '.kt-root > [data-kt="legend"] { display: grid; justify-items: center; width: 46ch; max-width: 100%; min-height: 44px; font-size: .8rem; }',
  ".kt-guide-open { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 6px 16px; border-radius: 999px; border: 1px solid rgba(0,0,0,.3); background: var(--kt-cell); color: var(--kt-cell-ink); font: inherit; font-size: .95rem; font-weight: 700; cursor: pointer; }",
  ".kt-guide-open b { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--kt-cell-ink); color: var(--kt-cell); font-size: .8rem; }",
  ".kt-guide { box-sizing: border-box; width: min(34rem, calc(100vw - 1.5rem)); max-height: calc(100dvh - 2rem); overflow-y: auto; margin: auto; padding: 18px; border: 0; border-radius: 16px; background: var(--kt-cell); color: var(--kt-cell-ink); font-family: system-ui, sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,.45); }",
  ".kt-guide::backdrop { background: rgba(0,0,0,.6); }",
  ".kt-guide * { box-sizing: border-box; }",
  ".kt-guide-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }",
  ".kt-guide h2 { margin: 0; font-size: 1.2rem; }",
  ".kt-guide h3 { margin: 18px 0 6px; font-size: 1.02rem; }",
  ".kt-guide p { margin: 0 0 8px; font-size: .92rem; line-height: 1.4; }",
  ".kt-guide-x { flex: none; width: 44px; height: 44px; margin: -6px -8px 0 0; border: 0; border-radius: 50%; background: transparent; color: inherit; font-size: 1.6rem; cursor: pointer; }",
  ".kt-guide ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }",
  ".kt-guide li { display: flex; align-items: center; gap: 12px; }",
  ".kt-guide li > .kt-cell, .kt-guide li > .kt-key { flex: none; width: 48px; height: 48px; min-height: 0; max-width: none; }",
  ".kt-guide > p { margin-top: 14px; }",
  ".kt-guide li p { margin: 0; font-size: .95rem; }",
  ".kt-guide li strong { display: block; }",
  ".kt-guide-keys { display: flex; flex-wrap: wrap; gap: 10px; }",
  ".kt-guide-keys .kt-key { flex: none; display: grid; place-items: center; width: 48px; height: 48px; max-width: none; }",
  ".kt-guide-done { display: block; width: 100%; min-height: 48px; margin-top: 18px; border: 0; border-radius: 10px; background: var(--kt-cell-ink); color: var(--kt-cell); font: inherit; font-weight: 700; cursor: pointer; }",
  ".kt-guide button:focus-visible, .kt-guide-open:focus-visible { outline: 3px solid var(--kt-typed); outline-offset: 2px; }",
].join("\n");

type Say = (key: keyof KotobaStrings) => string;
type Mark = "hit" | "near" | "kin" | "miss";

/** An element with a class and, if given, its text. */
function make<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, className: string, text?: string) {
  const element = doc.createElement(tag);
  if (className !== "") element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/** The button and its dialog for a game in letters or in kana, in the words `say` gives.
 *
 * @param doc - The document that will own them.
 * @param say - The game's words.
 * @param kana - Whether the game is in kana, which adds yellow and the arrows.
 * @returns The button, then the dialog, to be put next to each other.
 */
export function drawGuide(doc: Document, say: Say, kana: boolean): [HTMLButtonElement, HTMLDialogElement] {
  const open = make(doc, "button", "kt-guide-open");
  open.type = "button";
  open.dataset.kt = "guide-open";
  open.setAttribute("aria-haspopup", "dialog");
  open.append(make(doc, "b", "", "?"), say("guideOpen"));
  open.firstElementChild?.setAttribute("aria-hidden", "true");

  const dialog = make(doc, "dialog", "kt-guide");
  dialog.dataset.kt = "guide";
  dialog.setAttribute("aria-label", say("guideTitle"));
  /** The dialog's contents, made when it is opened and taken away when it closes, so a closed guide leaves no cells on the page for a page's own counting. */
  const fill = () => {
    const close = () => dialog.close();
    const x = make(doc, "button", "kt-guide-x", "×");
    x.type = "button";
    x.dataset.kt = "guide-close";
    x.setAttribute("aria-label", say("guideClose"));
    x.addEventListener("click", close);
    const head = make(doc, "div", "kt-guide-head");
    head.append(make(doc, "h2", "", say("guideTitle")), x);

    /** One line: an example mark, its colour's name in bold, and what it means. */
    const row = (example: HTMLElement, name: string, text: string) => {
      const line = make(doc, "li", "");
      const words = make(doc, "p", "");
      words.append(make(doc, "strong", "", name), text);
      line.append(example, words);
      return line;
    };
    const cell = (mark: Mark, letter: string, wrong?: "size" | "tone" | "both") => {
      const span = make(doc, "span", "kt-cell", letter);
      span.dataset.mark = mark;
      span.setAttribute("aria-hidden", "true");
      if (wrong === "size" || wrong === "both") span.dataset.size = "wrong";
      if (wrong === "tone" || wrong === "both") span.dataset.tone = "wrong";
      return span;
    };
    const key = (mark: Mark | "", letter: string) => {
      const span = make(doc, "span", "kt-key", letter);
      span.dataset.mark = mark;
      span.setAttribute("aria-hidden", "true");
      return span;
    };
    const list = (...rows: HTMLElement[]) => {
      const ul = make(doc, "ul", "");
      ul.append(...rows);
      return ul;
    };
    const section = (title: string, lead: string, ...body: HTMLElement[]) => {
      const part = make(doc, "section", "");
      part.append(make(doc, "h3", "", title), make(doc, "p", "", lead), ...body);
      return part;
    };

    const board = [
      row(cell("hit", kana ? "あ" : "A"), say("guideGreen"), say(kana ? "guideHitKana" : "guideHitLetter")),
      row(cell("near", kana ? "い" : "B"), say("guideOrange"), say(kana ? "guideNearKana" : "guideNearLetter")),
      ...(kana ? [row(cell("kin", "か"), say("guideYellow"), say("guideKin"))] : []),
      row(cell("miss", kana ? "う" : "C"), say("guideGrey"), say(kana ? "guideMissKana" : "guideMissLetter")),
    ];
    const keys = make(doc, "div", "kt-guide-keys");
    keys.append(key("hit", "A"), key("near", "B"), key("miss", "C"), key("", "D"));
    dialog.replaceChildren(
      head,
      section(say("guideBoard"), say(kana ? "guideBoardKana" : "guideBoardLetters"), list(...board)),
      ...(kana
        ? [
            section(
              say("guideArrows"),
              say("guideArrowsLead"),
              list(
                row(cell("hit", "っ", "size"), say("guideArrowDownName"), say("guideArrowDown")),
                row(cell("hit", "ぱ", "tone"), say("guideArrowUpName"), say("guideArrowUp")),
                row(cell("hit", "づ", "both"), say("guideArrowBothName"), say("guideArrowBoth")),
              ),
            ),
          ]
        : []),
      section(say("guideKeyboard"), say("guideKeyboardLead"), keys),
      make(doc, "p", "", say("guideShapes")),
    );
    const done = make(doc, "button", "kt-guide-done", say("guideDone"));
    done.type = "button";
    done.dataset.kt = "guide-done";
    done.addEventListener("click", close);
    dialog.append(done);
  };

  open.addEventListener("click", () => {
    fill();
    dialog.showModal();
  });
  // The close event comes a moment after the dialog shuts: a guide opened again in between is left alone.
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    dialog.replaceChildren();
    // Not every browser gives the focus back to the button that opened the dialog.
    open.focus();
  });
  // A press on the backdrop lands on the dialog itself, never on what is inside it.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  return [open, dialog];
}
