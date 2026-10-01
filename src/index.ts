/**
 * Kotoba: word lists and the rules of word games, in English, French, German
 * and Japanese. The lists themselves are entry points of their own, so a page
 * loads only what it plays: see the README.
 */
export * from "./marks.ts";
export * from "./lists.ts";
export * from "./wordScore.ts";
export * from "./keyboardRows.ts";
export * from "./kana/kanaMarks.ts";
export * from "./kana/romaji.ts";
export * from "./kana/kanaScore.ts";
export { VERSION } from "./version.ts";
