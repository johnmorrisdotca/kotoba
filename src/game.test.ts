import { describe, expect, it } from "vitest";

import { WORD_GAME_ROWS, changeWordGame, eraseWordGame, guessMarks, keyMarks, startWordGame, submitWordGame, typeWordGame, wordGameKeys, type WordGame } from "./game.ts";
import { kanaScore } from "./kana/kanaScore.ts";
import { wordScore } from "./wordScore.ts";

const words = { allowed: new Set(["crane", "react", "slate", "stone", "bumpy", "caret"]), answers: ["crane", "react"] };

/** Type a word one key at a time, at the time given. */
const typed = (game: WordGame, text: string, now = 1000) => [...text].reduce((round, key) => typeWordGame(round, key, now), game);

describe("a round of letters", () => {
  it("starts empty, with six guesses unless said", () => {
    const game = startWordGame("en", 5, "crane");
    expect(game).toEqual({ language: "en", size: 5, rows: WORD_GAME_ROWS, hidden: "crane", guesses: [], typed: [], pending: "", status: "playing", startedAt: null, score: null });
    expect(WORD_GAME_ROWS).toBe(6);
    expect(startWordGame("en", 5, "crane", 4).rows).toBe(4);
  });

  it("takes letters of the language's keyboard up to the word's length, and starts the clock at the first key", () => {
    let game = startWordGame("en", 5, "crane");
    game = typeWordGame(game, "c", 500);
    expect(game.startedAt).toBe(500);
    game = typed(game, "rane", 900);
    expect(game.typed.join("")).toBe("crane");
    expect(game.startedAt).toBe(500);
    expect(typeWordGame(game, "x")).toBe(game);
    expect(typeWordGame(startWordGame("en", 5, "crane"), "é").typed).toEqual([]);
    expect(typeWordGame(startWordGame("en", 5, "crane"), "ab").typed).toEqual([]);
    expect(typeWordGame(startWordGame("en", 5, "crane"), "A").typed).toEqual([]);
    expect(typeWordGame(startWordGame("de", 4, "über"), "ü").typed).toEqual(["ü"]);
    expect(wordGameKeys("fr")).toBe("azertyuiopqsdfghjklmwxcvbn");
  });

  it("leaves the round it was given alone", () => {
    const before = startWordGame("en", 5, "crane");
    const copy = JSON.stringify(before);
    typed(before, "crane");
    submitWordGame(typed(before, "crane"), words);
    eraseWordGame(typed(before, "cr"));
    expect(JSON.stringify(before)).toBe(copy);
  });

  it("takes back the last letter", () => {
    expect(eraseWordGame(typed(startWordGame("en", 5, "crane"), "cra")).typed.join("")).toBe("cr");
    expect(eraseWordGame(startWordGame("en", 5, "crane")).typed).toEqual([]);
  });

  it("refuses a guess that is too short or not in the list, and keeps what was typed", () => {
    const short = submitWordGame(typed(startWordGame("en", 5, "crane"), "cra"), words);
    expect(short.refused).toBe("too-short");
    expect(short.game.typed.join("")).toBe("cra");
    expect(short.game.guesses).toEqual([]);
    const unknown = submitWordGame(typed(startWordGame("en", 5, "crane"), "zzzzz"), words);
    expect(unknown.refused).toBe("not-a-word");
    expect(unknown.game.typed.join("")).toBe("zzzzz");
    expect(unknown.game.status).toBe("playing");
  });

  it("takes a guess from the answers even when `allowed` does not list it", () => {
    const only = { allowed: new Set<string>(), answers: ["crane"] };
    expect(submitWordGame(typed(startWordGame("en", 5, "crane"), "crane"), only).refused).toBeNull();
  });

  it("is won by the hidden word, scored from the guesses and the time", () => {
    let game = typed(startWordGame("en", 5, "crane"), "slate", 1000);
    game = submitWordGame(game, words).game;
    expect(game.status).toBe("playing");
    expect(game.guesses).toEqual(["slate"]);
    expect(game.typed).toEqual([]);
    game = typed(game, "crane", 5000);
    const done = submitWordGame(game, words, 31_000);
    expect(done.refused).toBeNull();
    expect(done.game.status).toBe("won");
    expect(done.game.score).toEqual(wordScore("crane", ["slate", "crane"], 6, 30_000));
    expect(typeWordGame(done.game, "a")).toBe(done.game);
    expect(eraseWordGame(done.game)).toBe(done.game);
    expect(submitWordGame(done.game, words).game).toBe(done.game);
  });

  it("is lost when the guesses run out, and still scored", () => {
    let game = startWordGame("en", 5, "crane", 2);
    game = submitWordGame(typed(game, "slate", 0), words, 0).game;
    const done = submitWordGame(typed(game, "stone", 0), words, 10_000).game;
    expect(done.status).toBe("lost");
    expect(done.guesses).toEqual(["slate", "stone"]);
    expect(done.score).toEqual(wordScore("crane", ["slate", "stone"], 2, 10_000));
  });

  it("marks a guess, and colours a keyboard with the best each letter has earned", () => {
    const game = { ...startWordGame("en", 5, "crane"), guesses: ["react", "slate"] };
    expect(guessMarks(game, "react").map((one) => one.mark)).toEqual(["near", "near", "hit", "near", "miss"]);
    expect(guessMarks(game, "react").every((one) => !one.wrongSize && !one.wrongMark)).toBe(true);
    const keys = keyMarks(game);
    expect(keys.get("a")).toBe("hit");
    expect(keys.get("r")).toBe("near");
    expect(keys.get("t")).toBe("miss");
    expect(keys.get("e")).toBe("hit");
    expect(keys.get("c")).toBe("near");
    expect(keys.get("q")).toBeUndefined();
    expect(keyMarks({ ...game, language: "ja" }).size).toBe(0);
  });
});

describe("a round of kana", () => {
  const kana = { allowed: new Set(["さくら", "かばん", "ひらく"]) };
  const start = (hidden = "さくら") => startWordGame("ja", 3, hidden);

  it("turns romaji into kana as it is typed, and waits on a consonant", () => {
    let game = typed(start(), "sa");
    expect(game.typed).toEqual(["さ"]);
    game = typeWordGame(game, "k", 10);
    expect(game.typed).toEqual(["さ"]);
    expect(game.pending).toBe("k");
    game = typeWordGame(game, "u", 11);
    expect(game.typed).toEqual(["さ", "く"]);
    expect(game.pending).toBe("");
    expect(typeWordGame(start(), "A").typed).toEqual([]);
    expect(typeWordGame(start(), "1").typed).toEqual([]);
  });

  it("takes back romaji not yet a kana before a kana", () => {
    const game = typed(start(), "sak");
    expect(eraseWordGame(game).pending).toBe("");
    expect(eraseWordGame(game).typed).toEqual(["さ"]);
    expect(eraseWordGame(eraseWordGame(game)).typed).toEqual([]);
  });

  it("changes the size and the mark of the last kana, and nothing for letters", () => {
    expect(changeWordGame(typed(start("かばん"), "tu"), "size").typed).toEqual(["っ"]);
    expect(changeWordGame(changeWordGame(typed(start(), "tu"), "size"), "size").typed).toEqual(["つ"]);
    expect(changeWordGame(typed(start(), "ha"), "mark").typed).toEqual(["ば"]);
    expect(changeWordGame(changeWordGame(typed(start(), "ha"), "mark"), "mark").typed).toEqual(["ぱ"]);
    expect(changeWordGame(start(), "mark").typed).toEqual([]);
    const letters = typed(startWordGame("en", 5, "crane"), "cr");
    expect(changeWordGame(letters, "size")).toBe(letters);
  });

  it("finishes romaji waiting on a vowel when the guess is sent, and wins on the exact word", () => {
    const game = typed(start(), "sakura");
    expect(game.typed).toEqual(["さ", "く", "ら"]);
    const won = submitWordGame(game, kana, 4000);
    expect(won.refused).toBeNull();
    expect(won.game.status).toBe("won");
    expect(won.game.score).toEqual(kanaScore("さくら", ["さくら"], 6, 3000));
    const ending = submitWordGame(typed(startWordGame("ja", 3, "かばん"), "kabann"), { allowed: new Set(["かばん"]) });
    expect(ending.game.status).toBe("won");
  });

  it("marks kana, a kana of the wrong size or mark counting as placed with an arrow", () => {
    const game = { ...start("はな"), size: 2 };
    expect(guessMarks(game, "ばな")).toEqual([{ mark: "hit", wrongSize: false, wrongMark: true }, { mark: "hit", wrongSize: false, wrongMark: false }]);
  });

  it("refuses a kana guess too short or not in the list", () => {
    expect(submitWordGame(typed(start(), "sa"), kana).refused).toBe("too-short");
    expect(submitWordGame(typed(start(), "nanana"), kana).refused).toBe("not-a-word");
  });
});
