/**
 * Every word Kotoba says to a person, in English and Japanese: what the word
 * game says (the prompts, the keys, the legend of the marks) and what the
 * command line says. One table, so the two languages are kept side by side and
 * a test can hold them together. `{n}`, `{word}` and the other braces are filled
 * in with `kotobaSay`; a table of your own must keep them.
 */

/** The languages Kotoba speaks. This is the language of its words, not of the word lists: a list in French is played with English words or Japanese ones. */
export type Language = "en" | "ja";

/** The names of the strings. Each is one line or one block of text. */
export type KotobaStrings = {
  /** The lists, by their names for themselves. */
  listEn: string;
  listFr: string;
  listDe: string;
  listJa: string;
  letters: string;
  kana: string;
  /** The game's words. */
  loading: string;
  ready: string;
  readyKana: string;
  notWord: string;
  tooShort: string;
  won: string;
  lost: string;
  enter: string;
  back: string;
  small: string;
  mark: string;
  legendLetters: string;
  legendKana: string;
  markHit: string;
  markNear: string;
  markMiss: string;
  markKin: string;
  arrowSize: string;
  arrowTone: string;
  empty: string;
  row: string;
  /** The command line's help, whole, and its words. */
  cliUsage: string;
  cliUnknown: string;
  cliNeeds: string;
  cliTryHelp: string;
  cliLangBad: string;
  cliNoCommand: string;
  cliCommandBad: string;
  cliWordsBad: string;
  cliSizeBad: string;
  cliTierBad: string;
  cliDayBad: string;
  cliZoneBad: string;
  cliNoWord: string;
  cliNoMarkWords: string;
  cliLengthsDiffer: string;
  cliNotLetters: string;
  cliNoList: string;
  cliCheckHead: string;
  cliMayGuess: string;
  cliMayHide: string;
  cliIsEasy: string;
  cliYes: string;
  cliNo: string;
  cliDaily: string;
  cliListsHead: string;
};

/** Every string, in both languages. The Japanese has not yet been read by a native reader. */
export const KOTOBA_STRINGS: Record<Language, KotobaStrings> = {
  en: {
    listEn: "English",
    listFr: "Français",
    listDe: "Deutsch",
    listJa: "かな",
    letters: "{n} letters",
    kana: "{n} kana",
    loading: "Loading the words…",
    ready: "Guess the {n}-letter word. Type, then press Enter.",
    readyKana: "Guess the {n}-kana word. Type it in romaji, then press Enter.",
    notWord: "That is not in the word list.",
    tooShort: "Not enough letters.",
    won: "Found it in {n}! {score} points.",
    lost: "Out of guesses. The word was {word}. {score} points.",
    enter: "Enter",
    back: "Delete",
    small: "小",
    mark: "゛゜",
    legendLetters: "Green: right place. Orange: in the word, elsewhere. Grey: not in the word.",
    legendKana: "Green: right place (an arrow if its size or mark is wrong). Orange: elsewhere. Yellow: the same row of the kana table. Grey: none of these.",
    markHit: "right place",
    markNear: "elsewhere in the word",
    markMiss: "not in the word",
    markKin: "same row of the kana table",
    arrowSize: "wrong size",
    arrowTone: "wrong mark",
    empty: "empty",
    row: "Guess {n}",
    cliUsage: `Usage: kotoba <command> [options]

Word lists and the rules of word games: English, French, German and Japanese kana.

  kotoba check crane                    is it a word, and may it be the hidden one?
  kotoba check さくら                   the same for a word in kana
  kotoba list --words fr --size 5       the words of a list, one to a line
  kotoba list --size 5 --tier easy      only the easy answers
  kotoba mark crane react               mark a guess against the hidden word
  kotoba daily --words en --size 5      the word of the day, the same for everybody
  kotoba lists                          every list, and how many words it holds

Options:
      --words <en|fr|de|ja>    the list: English, French, German or Japanese kana (en unless said)
      --size <n>               letters or kana in a word: 4 to 6, or 3 to 5 for ja (5, or 4 for ja, unless said)
      --tier <easy|answers|allowed>
                               list, daily: which words: the easy answers, every answer, or every word
                               that may be guessed (answers unless said; daily takes easy or answers)
      --date <YYYY-MM-DD>      daily: the day (today, in UTC, unless said)
      --zone <zone>            daily: today by an IANA time zone's midnight
  -j, --json                   print JSON (format 1)
      --lang <en|ja>           English or Japanese (default: your system's)
  -h, --help                   this help
  -v, --version                the version

check reads the list from the word itself (kana make it ja) and the size from its length.
Exit codes: 0 done, 1 what was asked for is not so or could not be done (a word that is not in
the list), 2 the command was wrong.
`,
    cliUnknown: "unknown option {part}",
    cliNeeds: "{part} needs a value",
    cliTryHelp: "Try `kotoba --help`.",
    cliLangBad: "--lang takes en or ja",
    cliNoCommand: "say what to do: check, list, mark, daily or lists",
    cliCommandBad: "“{part}” is not a command: check, list, mark, daily or lists",
    cliWordsBad: "--words takes en, fr, de or ja",
    cliSizeBad: "--size takes a whole number: {sizes}",
    cliTierBad: "--tier takes {tiers}",
    cliDayBad: "--date takes a day written YYYY-MM-DD",
    cliZoneBad: "“{part}” is not a time zone this system knows",
    cliNoWord: "give the word to check",
    cliNoMarkWords: "give the guess and then the hidden word",
    cliLengthsDiffer: "the guess has {guess} letters and the hidden word {hidden}",
    cliNotLetters: "“{part}” is not made of letters of one language's alphabet",
    cliNoList: "there is no list of {size} in {words}: {sizes}",
    cliCheckHead: "{word}  {words}, {size}",
    cliMayGuess: "may be guessed",
    cliMayHide: "may be the hidden word",
    cliIsEasy: "an easy word",
    cliYes: "yes",
    cliNo: "no",
    cliDaily: "{day}  {word}",
    cliListsHead: "List,Size,Easy,Answers,Allowed",
  },
  ja: {
    listEn: "English",
    listFr: "Français",
    listDe: "Deutsch",
    listJa: "かな",
    letters: "{n}文字",
    kana: "{n}かな",
    loading: "単語を読み込んでいます…",
    ready: "{n}文字の単語を当ててください。入力して Enter を押します。",
    readyKana: "{n}かなの単語を当ててください。ローマ字で入力して Enter を押します。",
    notWord: "その単語はリストにありません。",
    tooShort: "文字が足りません。",
    won: "{n}回で正解！ {score}点。",
    lost: "残念、正解は {word} でした。{score}点。",
    enter: "決定",
    back: "削除",
    small: "小",
    mark: "゛゜",
    legendLetters: "緑: 場所が合っています。橙: 単語のほかの場所にあります。灰: 含まれません。",
    legendKana: "緑: 場所が合っています（大きさや濁点が違うときは矢印つき）。橙: ほかの場所にあります。黄: 同じ行のかなです。灰: どれでもありません。",
    markHit: "場所が合っている",
    markNear: "単語のほかの場所にある",
    markMiss: "含まれない",
    markKin: "かな表の同じ行",
    arrowSize: "大きさが違う",
    arrowTone: "濁点などが違う",
    empty: "空",
    row: "{n}回目",
    cliUsage: `使い方: kotoba <コマンド> [オプション]

単語リストと、言葉遊びのルール。英語、フランス語、ドイツ語、日本語（かな）に対応しています。

  kotoba check crane                    単語か、答えになりうるかを調べます
  kotoba check さくら                   かなの単語も同じように調べます
  kotoba list --words fr --size 5       リストの単語を1行に1つずつ表示します
  kotoba list --size 5 --tier easy      やさしい答えだけを表示します
  kotoba mark crane react               推測を、隠された単語に照らして判定します
  kotoba daily --words en --size 5      今日の単語（誰にとっても同じです）
  kotoba lists                          すべてのリストと、その単語数を表示します

オプション:
      --words <en|fr|de|ja>    リスト: 英語、フランス語、ドイツ語、日本語のかな（指定なしは en）
      --size <n>               単語の文字数（かなの数）: 4〜6、ja は3〜5（指定なしは5、ja は4）
      --tier <easy|answers|allowed>
                               list, daily: どの単語か: やさしい答え、すべての答え、推測できるすべての単語
                               （指定なしは answers。daily は easy か answers）
      --date <YYYY-MM-DD>      daily: 日付（指定なしは、UTCの今日）
      --zone <zone>            daily: IANAタイムゾーンの午前0時で切り替わる今日
  -j, --json                   JSON（形式1）で表示します
      --lang <en|ja>           英語または日本語（指定なしはシステムの言語）
  -h, --help                   このヘルプ
  -v, --version                バージョン

check は、単語そのものからリスト（かななら ja）を、長さからサイズを決めます。
終了コード: 0 完了、1 そうではない、またはできなかった（リストにない単語）、2 コマンドの誤り。
`,
    cliUnknown: "不明なオプションです: {part}",
    cliNeeds: "{part} には値が必要です",
    cliTryHelp: "`kotoba --help` をご覧ください。",
    cliLangBad: "--lang は en か ja です",
    cliNoCommand: "コマンドを指定してください: check, list, mark, daily, lists",
    cliCommandBad: "「{part}」はコマンドではありません: check, list, mark, daily, lists",
    cliWordsBad: "--words は en, fr, de, ja のいずれかです",
    cliSizeBad: "--size は整数です: {sizes}",
    cliTierBad: "--tier は {tiers} です",
    cliDayBad: "--date は YYYY-MM-DD の形の日付です",
    cliZoneBad: "「{part}」は、このシステムが知らないタイムゾーンです",
    cliNoWord: "調べる単語を指定してください",
    cliNoMarkWords: "推測、そのあとに隠された単語を指定してください",
    cliLengthsDiffer: "推測は{guess}文字、隠された単語は{hidden}文字です",
    cliNotLetters: "「{part}」は、ひとつの言語のアルファベットの文字でできていません",
    cliNoList: "{words} に {size} のリストはありません: {sizes}",
    cliCheckHead: "{word}  {words}、{size}",
    cliMayGuess: "推測できる",
    cliMayHide: "隠された単語になりうる",
    cliIsEasy: "やさしい単語",
    cliYes: "はい",
    cliNo: "いいえ",
    cliDaily: "{day}  {word}",
    cliListsHead: "リスト,長さ,やさしい,答え,すべて",
  },
};

/** A string with its braces filled in from `values`; a brace with no value is left as it is. */
export function kotobaSay(text: string, values: Readonly<Record<string, string | number>> = {}): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/** The language a person asked for, by `en` or `ja` or a tag that begins with one: English for anything else. */
export function kotobaLanguage(tag: string | undefined): Language {
  return (tag ?? "en").toLowerCase().startsWith("ja") ? "ja" : "en";
}
