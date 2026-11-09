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
  it("lets a name that is also slang pass alone, never beside the word that makes the joke", () => {
    for (const value of [
      "Dick",
      "Dick Smith",
      "Moby Dick",
      "Willy Wonka",
      "Long Island",
      "Peter Long",
      "Johnson Family",
      "Hard Rock",
      "Big Bear",
      "Mike Hunter",
      "Hugh Grant",
      "Ben Smith",
    ])
      expect(checkText(value), value).toEqual({ ok: true });
    for (const value of [
      "Big Dick",
      "Dick Is Big",
      "dick is hard",
      "Hard Dick",
      "Dick Long",
      "Sucks Dick",
      "Big Willy",
      "Long Johnson",
      "Big Cox",
      "MY D1CK",
    ])
      expect(checkText(value), value).toMatchObject({ ok: false, reason: "blocked" });
  });
  it("sees the joke through digits, stretched, spaced and misspelt names, and run together", () => {
    for (const value of [
      "D1ck hard",
      "d!ck hard",
      "Diiick hard",
      "D.i.c.k hard",
      "Dikk Hard",
      "Dic Hard",
      "Dyck hard",
      "dickhard",
      "DickHard",
      "Bigdick",
      "B1g D1ck",
    ])
      expect(checkText(value), value).toMatchObject({ ok: false, reason: "blocked" });
    for (const value of ["D1ck", "Dick Hardy", "Dick Hardwick"]) expect(checkText(value), value).toEqual({ ok: true });
  });
  it("sees respelt and masked words: sound-alikes, digits, stars", () => {
    for (const value of [
      "pu$$y",
      "pu$$(y)",
      "puzzy",
      "pu22y",
      "pussee",
      "pussi",
      "p*ssy",
      "sh*t",
      "c*nt",
      "f**k",
      "sl*t",
      "fvck",
      "phuck",
      "fuk",
      "fuq",
      "fck",
      "biatch",
      "cnut",
      "pr0n",
      "n00dz",
      "boobz",
      "sheeit",
    ])
      expect(checkText(value), value).toMatchObject({ ok: false, reason: "blocked" });
  });
  it("does not refuse ordinary names that hold a barred word or sound like one", () => {
    for (const value of [
      "Charlotte",
      "Cassie",
      "Kass",
      "Bass",
      "Grass",
      "Glasshouse",
      "Moon Pie",
      "Puss in Boots",
      "Fuchsia",
      "Shitake",
      "Phuket",
      "Fukuoka",
      "Woodcock",
      "Merdani",
      "Foderaro",
      "Porrata",
      "Concha",
      "Fica",
    ])
      expect(checkText(value), value).toEqual({ ok: true });
  });
  it("knows Spanish, Italian and Portuguese swearing", () => {
    for (const [value, lang] of [
      ["puta", "es"],
      ["mierda", "es"],
      ["gilipollas", "es"],
      ["cazzo", "it"],
      ["vaffanculo", "it"],
      ["caralho", "pt"],
      ["porra", "pt"],
    ] as const)
      expect(checkText(value, { lang }), value).toMatchObject({ ok: false, reason: "blocked" });
    expect(checkText("Pilar", { lang: "es" })).toEqual({ ok: true });
  });
  it("refuses the prank names that read as something else aloud, spaced or run together", () => {
    for (const value of [
      "Mike Hunt",
      "MikeHunt",
      "M1ke Hunt",
      "Hugh Jass",
      "Ben Dover",
      "Seymour Butts",
      "Hugh G Rection",
      "Dixie Normous",
      "Anita Bath",
      "Phil McCracken",
    ])
      expect(checkText(value), value).toMatchObject({ ok: false, reason: "blocked" });
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
