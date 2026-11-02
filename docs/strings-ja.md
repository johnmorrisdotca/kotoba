# Kotoba's words, in English and Japanese

Made from `src/strings.ts` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.

**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please
open a *Fix a translation* issue with the string's name. `{n}` and the other braces are filled in when shown.
Names that begin `cli` are the command line's; the others are the game's.

| Name | English | Japanese |
| --- | --- | --- |
| `listEn` | English | English |
| `listFr` | Français | Français |
| `listDe` | Deutsch | Deutsch |
| `listJa` | かな | かな |
| `letters` | {n} letters | {n}文字 |
| `kana` | {n} kana | {n}かな |
| `loading` | Loading the words… | 単語を読み込んでいます… |
| `ready` | Guess the {n}-letter word. Type, then press Enter. | {n}文字の単語を当ててください。入力して Enter を押します。 |
| `readyKana` | Guess the {n}-kana word. Type it in romaji, then press Enter. | {n}かなの単語を当ててください。ローマ字で入力して Enter を押します。 |
| `notWord` | That is not in the word list. | その単語はリストにありません。 |
| `tooShort` | Not enough letters. | 文字が足りません。 |
| `won` | Found it in {n}! {score} points. | {n}回で正解！ {score}点。 |
| `lost` | Out of guesses. The word was {word}. {score} points. | 残念、正解は {word} でした。{score}点。 |
| `enter` | Enter | 決定 |
| `back` | Delete | 削除 |
| `small` | 小 | 小 |
| `mark` | ゛゜ | ゛゜ |
| `legendLetters` | Green: right place. Orange: in the word, elsewhere. Grey: not in the word. | 緑色: 場所が合っています。オレンジ色: 単語のほかの場所にあります。グレー: 含まれません。 |
| `legendKana` | Green: right place (an arrow if its size or mark is wrong). Orange: elsewhere. Yellow: the same row of the kana table. Grey: none of these. | 緑色: 場所が合っています（大きさや濁点が違うときは矢印つき）。オレンジ色: ほかの場所にあります。黄色: 同じ行のかなです。グレー: どれでもありません。 |
| `markHit` | right place | 場所が合っている |
| `markNear` | elsewhere in the word | 単語のほかの場所にある |
| `markMiss` | not in the word | 含まれない |
| `markKin` | same row of the kana table | かな表の同じ行 |
| `arrowSize` | wrong size | 大きさが違う |
| `arrowTone` | wrong mark | 濁点などが違う |
| `empty` | empty | 空 |
| `row` | Guess {n} | {n}回目 |
| `lostTitle` | Out of guesses. The word was | 予想がなくなりました。単語は、こちらです。 |
| `wonTitle` | Found it in {n}! | {n}回で正解！ |
| `lostNote` | Good try. Now you know this word. | よくがんばりました。これで、この単語を知ることができました。 |
| `points` | {score} points | {score}点 |
| `guideOpen` | Colour guide | 色の見かた |
| `guideTitle` | What the colours and arrows mean | 色と矢印の意味 |
| `guideClose` | Close | 閉じる |
| `guideDone` | Got it | わかった |
| `guideBoard` | On the board | ボードの上で |
| `guideBoardLetters` | Every guess puts a colour on each letter. The colour tells you how that letter fits the hidden word. | 予想するたびに、文字ごとに色がつきます。色を見ると、その文字がかくれた単語にどう合っているかがわかります。 |
| `guideBoardKana` | Every guess puts a colour on each kana. The colour tells you how that kana fits the hidden word. | 予想するたびに、かなごとに色がつきます。色を見ると、そのかながかくれた単語にどう合っているかがわかります。 |
| `guideGreen` | Green | 緑色 |
| `guideHitLetter` | The letter is right, and it is in the right place. | 文字が合っていて、場所も合っています。 |
| `guideHitKana` | The kana is right, and it is in the right place. | かなが合っていて、場所も合っています。 |
| `guideOrange` | Orange | オレンジ色 |
| `guideNearLetter` | The word has this letter, but in a different place. | この文字は単語にありますが、場所がちがいます。 |
| `guideNearKana` | The word has this kana, but in a different place. | このかなは単語にありますが、場所がちがいます。 |
| `guideYellow` | Yellow | 黄色 |
| `guideKin` | Not this kana, but one from the same row of the kana chart belongs here. If you play か and the word has き there, you get yellow: both are in the K row. | このかなではありませんが、同じ行のかなが、ここに入ります。五十音表で、か・き・く・け・こは「か行」です。「か」を入れて、単語のそこが「き」なら、どちらも「か行」なので黄色です。 |
| `guideGrey` | Grey | グレー |
| `guideMissLetter` | The word does not have this letter at all. | この文字は単語にまったくありません。 |
| `guideMissKana` | The word does not have this kana, and nothing from its row belongs here. | このかなは単語になく、同じ行のかなもここには入りません。 |
| `guideArrows` | Arrows | 矢印 |
| `guideArrowsLead` | A small arrow on a green or orange kana means the kana is right, but it is not quite the one the word has. It is not found until the arrow is gone. | 緑色やオレンジ色のかなについた小さな矢印は、かなは合っているけれど、単語のかなとは少しちがう、という意味です。矢印が消えるまでは、見つかったことにはなりません。 |
| `guideArrowDownName` | Arrow down | 下向きの矢印 |
| `guideArrowDown` | The size is wrong: big つ or small っ. The 小 key changes the size. | 大きさがちがいます。たとえば、大きい「つ」と小さい「っ」です。「小」キーで大きさをかえられます。 |
| `guideArrowUpName` | Arrow up | 上向きの矢印 |
| `guideArrowUp` | The mark is wrong: は, ば or ぱ. The ゛゜ key changes the mark. | 点や丸（濁点・半濁点）がちがいます。たとえば、「は」「ば」「ぱ」です。「゛゜」キーで点や丸をかえられます。 |
| `guideArrowBothName` | Both arrows | 両方の矢印 |
| `guideArrowBoth` | The size and the mark are both wrong. | 大きさも、点や丸も、どちらもちがいます。 |
| `guideKeyboard` | On the keyboard | キーボードの上で |
| `guideKeyboardLead` | Each key takes the best colour any of your guesses gave that letter. A white key has not been tried yet. | それぞれのキーは、これまでの予想でその文字がもらった、いちばんよい色になります。白いキーは、まだためしていません。 |
| `guideShapes` | Each mark also has a small shape in its corner, so the colour is never the only clue: ● green, ◐ orange, ○ grey, and ≈ yellow in the kana game. | どのマスにも、すみに小さな形がついているので、手がかりは色だけではありません。● 緑色、◐ オレンジ色、○ グレー、かなのゲームでは ≈ 黄色。 |
| `guideTap` | Tap a guess to see what its word means. | 予想した行をタップすると、その単語の意味が見られます。 |
| `meaningFor` | {word}: {meaning} | {word}: {meaning} |
| `cliUnknown` | unknown option {part} | 不明なオプションです: {part} |
| `cliNeeds` | {part} needs a value | {part} には値が必要です |
| `cliTryHelp` | Try `kotoba --help`. | `kotoba --help` をご覧ください。 |
| `cliLangBad` | --lang takes en or ja | --lang は en か ja です |
| `cliNoCommand` | say what to do: check, list, mark, daily or lists | コマンドを指定してください: check, list, mark, daily, lists |
| `cliCommandBad` | “{part}” is not a command: check, list, mark, daily or lists | 「{part}」はコマンドではありません: check, list, mark, daily, lists |
| `cliWordsBad` | --words takes en, fr, de or ja | --words は en, fr, de, ja のいずれかです |
| `cliSizeBad` | --size takes a whole number: {sizes} | --size は整数です: {sizes} |
| `cliTierBad` | --tier takes {tiers} | --tier は {tiers} です |
| `cliDayBad` | --date takes a day written YYYY-MM-DD | --date は YYYY-MM-DD の形の日付です |
| `cliZoneBad` | “{part}” is not a time zone this system knows | 「{part}」は、このシステムが知らないタイムゾーンです |
| `cliNoWord` | give the word to check | 調べる単語を指定してください |
| `cliNoMarkWords` | give the guess and then the hidden word | 推測、そのあとに隠された単語を指定してください |
| `cliLengthsDiffer` | the guess has {guess} letters and the hidden word {hidden} | 推測は{guess}文字、隠された単語は{hidden}文字です |
| `cliNotLetters` | “{part}” is not made of letters of one language's alphabet | 「{part}」は、ひとつの言語のアルファベットの文字でできていません |
| `cliNoList` | there is no list of {size} in {words}: {sizes} | {words} に {size} のリストはありません: {sizes} |
| `cliCheckHead` | {word}  {words}, {size} | {word}  {words}、{size} |
| `cliMayGuess` | may be guessed | 推測できる |
| `cliMayHide` | may be the hidden word | 隠された単語になりうる |
| `cliIsEasy` | an easy word | やさしい単語 |
| `cliYes` | yes | はい |
| `cliNo` | no | いいえ |
| `cliDaily` | {day}  {word} | {day}  {word} |
| `cliListsHead` | List,Size,Easy,Answers,Allowed | リスト,長さ,やさしい,答え,すべて |

## The command line's help

`cliUsage`, in English:

```
Usage: kotoba <command> [options]

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
```

and in Japanese:

```
使い方: kotoba <コマンド> [オプション]

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
```
