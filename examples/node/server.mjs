// A server judges a guess with the same rules the game plays by: pure functions, no DOM, no browser globals.
import { dailyWord, dayKey, markGuess } from "@johnmorrisdotca/kotoba";
import { loadWordList } from "@johnmorrisdotca/kotoba/load";

const list = await loadWordList("en", 5);
const today = dailyWord(list.answers, dayKey(Date.now()), { salt: "en-5-answers" }); // the same word for everybody today
console.log(markGuess("crane", "react").join(" "), list.answers.includes(today)); // near near hit miss near true
