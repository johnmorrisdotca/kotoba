# Notice: the word lists' licences

The code of this package is under the MIT licence (see [LICENSE](LICENSE)). The
word lists in `src/lists/` (and `dist/lists/`) are data under their sources' own
terms, which travel with them. Each list's own file opens with the same notice,
written out in full.

| Entry point | Made from | Terms |
| --- | --- | --- |
| `words-en`, `pop-guesses` | SCOWL (http://wordlist.aspell.net/) | SCOWL's permissive notice, below |
| `words-fr` | Lexique 3.83, ranked by hermitdave's FrequencyWords, checked against Wiktionary | CC BY-SA 4.0 |
| `words-de` | LanguageTool's german-pos-dict, ranked by hermitdave's FrequencyWords, checked against Wiktionary | CC BY-SA 4.0 |
| `kana-3`, `kana-4`, `kana-5` | JMdict, of the Electronic Dictionary Research and Development Group | CC BY-SA 4.0 and the Group's conditions |
| `pop-answers` | The package's own hand-kept list | MIT |

## English: SCOWL

`words-en` and `pop-guesses` are written from SCOWL 2020.12.07
(http://wordlist.aspell.net/), English and American spellings. Its notice, which
its licence asks to travel with the lists:

> The collective work is Copyright 2000-2018 by Kevin Atkinson as well
> as any of the copyrights mentioned below:
>
>   Copyright 2000-2018 by Kevin Atkinson
>
>   Permission to use, copy, modify, distribute and sell these word
>   lists, the associated scripts, the output created from the scripts,
>   and its documentation for any purpose is hereby granted without fee,
>   provided that the above copyright notice appears in all copies and
>   that both that copyright notice and this permission notice appear in
>   supporting documentation. Kevin Atkinson makes no representations
>   about the suitability of this array for any purpose. It is provided
>   "as is" without express or implied warranty.

The full notice, with the copyrights of the lists SCOWL is built from, is in
SCOWL's own distribution.

## French and German: Creative Commons Attribution-ShareAlike 4.0

`words-fr` is derived from Lexique 3.83 (http://www.lexique.org), `words-de`
from LanguageTool's german-pos-dict (Morphy and korrekturen.de,
https://github.com/languagetool-org/german-pos-dict). Each is ranked by
hermitdave's FrequencyWords (OpenSubtitles 2018,
https://github.com/hermitdave/FrequencyWords) and checked against Wiktionary
(via https://kaikki.org). They are used under the Creative Commons
Attribution-ShareAlike 4.0 licence
(https://creativecommons.org/licenses/by-sa/4.0/), and these lists are shared
under the same licence.

## Japanese: JMdict

`kana-3`, `kana-4` and `kana-5` are derived from JMdict, the Japanese-Multilingual
Dictionary of the Electronic Dictionary Research and Development Group
(https://www.edrdg.org/). JMdict is the property of the EDRDG and is used under
the Creative Commons Attribution-ShareAlike 4.0 licence, with the group's
conditions: https://www.edrdg.org/edrdg/licence.html. These derived lists are
shared under the same licence. The release each was made from is in its `release`
field, and the lists are made again from the newest release every month.

## What that asks of a project that uses this package

- Keep this file with the package, and where your project lists its credits,
  credit SCOWL, Lexique, LanguageTool, hermitdave's FrequencyWords, Wiktionary,
  and JMdict and the EDRDG, for the lists you use.
- The French, German and Japanese lists are share-alike. If you copy one, change
  it, or make a list of your own from it, and pass that on, it stays under CC
  BY-SA 4.0 and says where it came from. The code stays MIT.
- If you need one list only, load only that one: each is a file of its own and
  nothing else in the package carries a word.

This is a description, not legal advice; the licences themselves are what hold.
