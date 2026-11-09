import { describe, expect, it } from "vitest";
import { checkText, isClean } from "./childrenFilter.ts";

const good = [
  "Grandma",
  "Mia",
  "Sam",
  "Hancock",
  "Cassandra",
  "Therapist",
  "Scunthorpe",
  "Dickens",
  "Assistant",
  "Classic",
  "Moon Pie",
  "Luna",
  "class",
  "assess",
  "Sussex",
  "Essex",
  "cocktail",
  "peacock",
  "analysis",
  "カスミ",
  "かすみ",
  "バカンス",
  "シネマ",
  "ミケ",
  "ひなた",
  "さくら",
  "ハルト",
  "ゆうき",
  "ばかり",
  "しねま",
  "ハゲタカ",
  "Mary-Jane O'Neil",
  "Star 7",
  "Zoe 12",
];

describe("children's text filter", () => {
  it("finds blocked words and typing tricks", () => {
    for (const value of [
      "shit",
      "SHIT",
      "sh1t",
      "$hit",
      "f u c k",
      "f.u.c.k",
      "fuuuuck",
      "bitches",
      "ＦＵＣＫ",
      "xxmotherfuckeryy",
      "バカ",
      "ばか",
      "しね",
      "死ね",
      "バカヤロウ",
      "ばかやろう",
      "うんこのバカヤロウ",
    ])
      expect(checkText(value), value).toMatchObject({ ok: false, reason: "blocked" });
  });
  it("keeps ordinary names and words", () => {
    for (const value of good) expect(checkText(value), value).toEqual({ ok: true });
    // A barred word that is also a given name passes (John, 2026-11-09); the insult built on it does not.
    expect(checkText("Dick")).toEqual({ ok: true });
    expect(checkText("dickhead")).toMatchObject({ ok: false, reason: "blocked" });
  });
  it("finds contact details", () => {
    for (const value of [
      "mia@example.com",
      "www.example.com",
      "http://x.y",
      "star.com",
      "5551234567",
      "555 123 4567",
      "1234",
      "123 Main Street",
    ])
      expect(checkText(value), value).toMatchObject({ ok: false, reason: "personal" });
  });
  it("checks shape and length", () => {
    for (const value of ["", " ", "***", "<b>hi</b>"])
      expect(checkText(value), value).toEqual({ ok: false, reason: "shape" });
    expect(checkText("x".repeat(31), { maxLength: 30 })).toEqual({ ok: false, reason: "shape" });
    expect(checkText("x".repeat(41))).toEqual({ ok: false, reason: "shape" });
    expect(checkText("a b c")).toEqual({ ok: true });
    expect(checkText("  Mia   K. ")).toEqual({ ok: true });
  });
  it("selects languages and defaults to all", () => {
    expect(isClean("merde", { lang: "fr" })).toBe(false);
    expect(isClean("arsch", { lang: "de" })).toBe(false);
    expect(isClean("うんこ", { lang: "ja" })).toBe(false);
    expect(isClean("fuck", { lang: "en" })).toBe(false);
    expect(isClean("fuck", { lang: "ja" })).toBe(true);
    expect(isClean("fuck")).toBe(false);
  });
});
