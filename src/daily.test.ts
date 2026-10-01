import { describe, expect, it } from "vitest";

import { dailyIndex, dailyWord, dayKey, dayNumber, isDayKey } from "./daily.ts";
import { readWordLists } from "./lists.ts";
import { EN_WORDS } from "./lists/words-en.data.ts";

describe("days", () => {
  it("are written YYYY-MM-DD, and only real dates are days", () => {
    for (const real of ["2026-10-01", "2024-02-29", "0000-01-01", "9999-12-31", "1970-01-01"]) expect(isDayKey(real), real).toBe(true);
    for (const wrong of ["2026-02-29", "2026-13-01", "2026-00-10", "2026-10-32", "26-10-01", "2026-1-1", "2026/10/01", "", "today", " 2026-10-01"]) expect(isDayKey(wrong), wrong).toBe(false);
    expect(isDayKey(20261001)).toBe(false);
    expect(isDayKey(null)).toBe(false);
  });

  it("are counted from 1970-01-01, by the calendar alone", () => {
    expect(dayNumber("1970-01-01")).toBe(0);
    expect(dayNumber("1970-01-02")).toBe(1);
    expect(dayNumber("2026-10-01")).toBe(20_727);
    expect(dayNumber("1969-12-31")).toBe(-1);
    expect(dayNumber("2026-03-09") - dayNumber("2026-03-08")).toBe(1);
    expect(() => dayNumber("2026-02-30")).toThrow(RangeError);
  });

  it("are the day a moment falls on in UTC, or in the zone named", () => {
    const moment = new Date("2026-10-01T23:30:00Z");
    expect(dayKey(moment)).toBe("2026-10-01");
    expect(dayKey(moment, "UTC")).toBe("2026-10-01");
    expect(dayKey(moment, "Asia/Tokyo")).toBe("2026-10-02");
    expect(dayKey(moment, "America/Los_Angeles")).toBe("2026-10-01");
    expect(dayKey(new Date("2026-10-01T06:59:59Z"), "America/Los_Angeles")).toBe("2026-09-30");
    expect(dayKey(Date.UTC(2026, 0, 1))).toBe("2026-01-01");
    expect(dayKey(new Date(Date.UTC(1999, 11, 31, 23, 59)))).toBe("1999-12-31");
  });

  it("are refused, by name, for a moment or a zone that is nothing", () => {
    expect(() => dayKey(new Date("nonsense"))).toThrow(RangeError);
    expect(() => dayKey(new Date(), "Nowhere/Land")).toThrow(RangeError);
  });
});

describe("the word of the day", () => {
  it("is a pure function of the list and the day: the same on every call", () => {
    const words = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf"];
    expect(dailyWord(words, "2026-10-01")).toBe(dailyWord(words, "2026-10-01"));
    expect(dailyWord(words, new Date("2026-10-01T12:00:00Z"))).toBe(dailyWord(words, "2026-10-01"));
    expect(dailyWord(words, new Date("2026-10-01T23:30:00Z"), { zone: "Asia/Tokyo" })).toBe(dailyWord(words, "2026-10-02"));
  });

  it("deals every word once before any comes up again", () => {
    const count = 11;
    const words = Array.from({ length: count }, (_, at) => `w${at}`);
    const start = dayNumber("2026-10-01");
    const first = Math.ceil(start / count) * count;
    for (const from of [first, first + count, first + 5 * count]) {
      const seen = new Set<string>();
      for (let n = from; n < from + count; n += 1) seen.add(words[dailyIndex(count, dayOf(n))] as string);
      expect(seen.size, `cycle at ${from}`).toBe(count);
    }
  });

  it("deals a different order the next time round, and a different one for another salt", () => {
    const count = 11;
    const order = (from: number, salt = "") => Array.from({ length: count }, (_, at) => dailyIndex(count, dayOf(from + at), salt));
    const first = Math.ceil(dayNumber("2026-10-01") / count) * count;
    expect(order(first)).not.toEqual(order(first + count));
    expect(order(first)).not.toEqual(order(first, "en-5"));
    expect(order(first, "en-5")).toEqual(order(first, "en-5"));
  });

  it("is pinned: these days are these words, so a daily word can be told to somebody", () => {
    const five = readWordLists(EN_WORDS, 5)!.answers;
    const picked = ["2026-10-01", "2026-10-02", "2026-10-03"].map((day) => dailyWord(five, day, { salt: "en-5" }));
    expect(picked).toEqual(PINNED);
    expect(five).toContain(picked[0]);
  });

  it("refuses an empty list and a day that is not one", () => {
    expect(() => dailyWord([], "2026-10-01")).toThrow(RangeError);
    expect(() => dailyIndex(0, "2026-10-01")).toThrow(RangeError);
    expect(() => dailyIndex(1.5, "2026-10-01")).toThrow(RangeError);
    expect(() => dailyWord(["a"], "2026-02-30")).toThrow(RangeError);
    expect(dailyWord(["only"], "2026-10-01")).toBe("only");
  });
});

/** The day a number counts to, in the calendar. */
function dayOf(number: number): string {
  return dayKey(new Date(number * 86_400_000));
}

const PINNED = ["atone", "chose", "tenth"];
