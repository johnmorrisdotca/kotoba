import { type LetterMark, markGuess } from "@johnmorrisdotca/kotoba";
import { loadWordList } from "@johnmorrisdotca/kotoba/load";

const list = await loadWordList("en", 5);
const marks: LetterMark[] = markGuess("crane", "react");
console.log(marks.join(" "), list?.allowed.has("crane"));

// @ts-expect-error a list of words is not a mark
const wrong: LetterMark = list;
console.log(typeof wrong);
