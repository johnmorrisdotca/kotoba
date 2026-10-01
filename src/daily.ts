/**
 * A WORD A DAY: the same word for everybody who asks for the same day. A day is
 * a calendar date, `2026-10-01`, UTC unless a time zone is named, so a word
 * turns over at one moment for everybody or at each place's own midnight.
 *
 * The words are dealt like a shuffled pack, a pack of the list's length: every
 * word comes up once before any comes up again, in an order a hash of the
 * `salt`, the length and the cycle decides. The day alone picks the place in
 * the pack, so no state is kept and no clock is read: `dailyWord(words,
 * "2026-10-01")` is a pure function.
 *
 * What it depends on, said plainly: the list. A word is the one at a place in
 * a pack the list's length and order make, so a list that gains or loses a
 * word, or is made again in another order, deals another pack, and the day
 * maps to another word. Keep the list fixed (pin the package's version, or
 * keep your own copy) for a word that stays put.
 */

/** A day's name: four digits of year, two of month and two of day, such as `2026-10-01`. */
export type DayKey = string;

const DAY_MS = 86_400_000;

/** Whether the text is a real calendar date written `YYYY-MM-DD`, from the year 0000 to 9999. */
export function isDayKey(text: unknown): text is DayKey {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(2000, month - 1, day));
  date.setUTCFullYear(year);
  return month >= 1 && month <= 12 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * The calendar day a moment falls on, as `YYYY-MM-DD`: in UTC unless an IANA
 * time zone such as `Asia/Tokyo` is named. A name is passed on to `Intl`, which
 * throws a `RangeError` for a zone it does not know.
 */
export function dayKey(moment: Date | number = new Date(), zone?: string): DayKey {
  const date = typeof moment === "number" ? new Date(moment) : moment;
  if (Number.isNaN(date.getTime())) throw new RangeError("not a moment in time");
  if (zone === undefined || zone === "UTC") {
    const year = String(date.getUTCFullYear()).padStart(4, "0");
    return `${year}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  }
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((one) => one.type === type)?.value ?? "";
  return `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
}

/** How many days after 1970-01-01 a day is, counting the calendar and nothing else: a day has no hours here. */
export function dayNumber(day: DayKey): number {
  if (!isDayKey(day)) throw new RangeError(`“${String(day)}” is not a day written YYYY-MM-DD`);
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  const at = new Date(Date.UTC(2000, month - 1, date));
  at.setUTCFullYear(year);
  return Math.round(at.getTime() / DAY_MS);
}

/** FNV-1a over the text's UTF-16 units: 32 bits, the same in every engine. */
function hash(text: string): number {
  let state = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    state ^= text.charCodeAt(i);
    state = Math.imul(state, 0x01000193) >>> 0;
  }
  return state;
}

/** A stream of numbers in [0, 1) fixed by a seed (mulberry32). */
function stream(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Which of `count` words a day gets, from 0 to `count - 1`. Over any run of
 * `count` days that starts at a multiple of `count` days after 1970-01-01,
 * every place comes up exactly once. `salt` names the list, so that two lists
 * of one length are not dealt in the same order.
 */
export function dailyIndex(count: number, day: DayKey, salt = ""): number {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("there are no words to pick from");
  const number = dayNumber(day);
  const cycle = Math.floor(number / count);
  const place = number - cycle * count;
  const random = stream(hash(`${salt}|${count}|${cycle}`));
  const pack = Array.from({ length: count }, (_, at) => at);
  for (let i = count - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pack[i], pack[j]] = [pack[j] as number, pack[i] as number];
  }
  return pack[place] as number;
}

/** How a day's word is chosen. */
export type DailyOptions = {
  /** Names the list, so that two lists of one length are dealt in different orders. Unless said, empty. */
  salt?: string;
  /** An IANA time zone, for a moment given as a `Date`: the word turns over at that place's midnight. Unless said, UTC. */
  zone?: string;
};

/**
 * The word of a day: the same for everybody who asks about the same day of the
 * same list. Give a `YYYY-MM-DD` day, or a `Date` (read as a day in UTC, or in
 * `zone`). Throws a `RangeError` for an empty list or a day that is not one.
 */
export function dailyWord(words: readonly string[], day: DayKey | Date | number = new Date(), options: DailyOptions = {}): string {
  const key = typeof day === "string" ? day : dayKey(day, options.zone);
  return words[dailyIndex(words.length, key, options.salt ?? "")] as string;
}
