import type { WordGame } from "./game.ts";
import type { KotobaStrings } from "./strings.ts";

/**
 * THE END OF A ROUND, drawn over the keyboard: the hidden word as a row of
 * tiles in the colour a right letter gets, large enough to read at a glance,
 * with a kind line under it. The keyboard has no use once a round is over, so
 * the card takes exactly its place (the card is a child of `.kt-keys`, over its rows) and nothing else
 * on the page moves when it appears. A round that was lost says it gently:
 * the word is the biggest thing there and the note is encouraging.
 */

/** The result card's rules, one to a line; part of `KOTOBA_PLAY_CSS`. */
export const KOTOBA_RESULT_CSS = [
  ".kt-keys { position: relative; }",
  '.kt-keys[data-over="true"] > .kt-key-row { visibility: hidden; }',
  ".kt-result { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 8px 10px; text-align: center; border-radius: calc(var(--kt-radius) * .6); background: rgba(0,0,0,.2); container-type: inline-size; }",
  ".kt-result-title { margin: 0; font-weight: 800; font-size: 1.05rem; line-height: 1.2; }",
  ".kt-result-word { display: grid; justify-content: center; gap: 5px; grid-template-columns: repeat(var(--n), minmax(0, var(--kt-cell-size))); width: 100%; }",
  ".kt-result-tile { aspect-ratio: 1; display: grid; place-items: center; border-radius: 9px; background: var(--kt-hit); color: #fff; font-weight: 800; line-height: 1; text-transform: uppercase; font-size: min(calc(100cqw / var(--n) * .52), calc(var(--kt-cell-size) * .5)); user-select: none; -webkit-user-select: none; }",
  ".kt-result-note { margin: 0; font-size: .85rem; opacity: .95; line-height: 1.25; }",
  // What the word means: one small line under the tiles, never more than two, so the card keeps the keyboard's place. With it the tiles are a little smaller, which is what pays for the line.
  ".kt-result-meaning { margin: 0; max-width: 100%; font-size: .85rem; line-height: 1.2; opacity: .95; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }",
  ".kt-result[data-meaning] { gap: 4px; padding: 6px 10px; }",
  ".kt-result[data-meaning] .kt-result-tile { font-size: min(calc(100cqw / var(--n) * .44), calc(var(--kt-cell-size) * .42)); }",
  ".kt-result[data-meaning] .kt-result-word { grid-template-columns: repeat(var(--n), minmax(0, calc(var(--kt-cell-size) * .8))); }",
  ".kt-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }",
].join("\n");

/** The card for a finished round, or null while it is still being played.
 *
 * @param doc - The document that will own the card.
 * @param round - The round being drawn.
 * @param say - The game's words, with their places filled in.
 * @param meaning - What the hidden word means, once it is known; nothing is drawn for it while it is null.
 * @returns The card for a finished round, or null while it is still being played.
 */
export function drawResult(
  doc: Document,
  round: WordGame | null,
  say: (key: keyof KotobaStrings, values?: Record<string, string | number>) => string,
  meaning: string | null = null,
): HTMLElement | null {
  if (round === null || round.status === "playing") return null;
  const won = round.status === "won";
  const card = doc.createElement("div");
  card.className = "kt-result";
  card.dataset.kt = "result";
  card.dataset.result = round.status;
  const title = doc.createElement("p");
  title.className = "kt-result-title";
  title.textContent = won ? say("wonTitle", { n: round.guesses.length }) : say("lostTitle");
  const word = doc.createElement("div");
  word.className = "kt-result-word";
  word.dataset.kt = "answer";
  word.setAttribute("role", "img");
  word.setAttribute("aria-label", round.hidden.toUpperCase());
  const letters = [...round.hidden];
  word.style.setProperty("--n", String(letters.length));
  for (const letter of letters) {
    const tile = doc.createElement("span");
    tile.className = "kt-result-tile";
    tile.setAttribute("aria-hidden", "true");
    tile.textContent = letter;
    word.append(tile);
  }
  const note = doc.createElement("p");
  note.className = "kt-result-note";
  const points = say("points", { score: round.score?.total ?? 0 });
  note.textContent = won ? points : `${say("lostNote")} ${points}`;
  card.append(title, word);
  if (meaning !== null) {
    const line = doc.createElement("p");
    line.className = "kt-result-meaning";
    line.dataset.kt = "meaning";
    line.textContent = meaning;
    card.dataset.meaning = "true";
    card.append(line);
  }
  card.append(note);
  return card;
}
