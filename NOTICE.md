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
| `idioms-ja`, `shiritori-ja`, `proverbs-ja`, `yojijukugo-ja` | JMdict and KANJIDIC2, of the Electronic Dictionary Research and Development Group | CC BY-SA 4.0 and the Group's conditions |
| `meanings-en-4`, `meanings-en-5`, `meanings-en-6`, `meanings-en` | Open English WordNet 2025, derived from Princeton WordNet 3.1 | CC BY 4.0 and the WordNet licence, below |
| `pop-answers` | The package's own hand-kept list | MIT |

## English meanings: Open English WordNet

`meanings-en-4`, `-5` and `-6` are written by `scripts/word-meanings-en.mjs` from Open English WordNet 2025
(https://en-word.net/; https://github.com/globalwordnet/english-wordnet, release 2025-edition, read 2026-11-04), which is
Copyright the Open English WordNet team, under the Creative Commons Attribution 4.0 International License
(https://creativecommons.org/licenses/by/4.0/). Its LICENSE.md says it "is derived from Princeton WordNet under the WordNet
License and further developed under the Creative Commons Attribution 4.0 International License. You may share and adapt
this resource providing attribution is given to both Princeton WordNet and the Open English Wordnet team." Each row is the
first definition of a word's commonest entry, cut short, or a regular or irregular form of an entry shown with that entry's
line; the choice of rows and the cutting are this package's own work. Its words that are not for children are left out
(`scripts/word-meanings-en.mjs` says how).

The Princeton WordNet licence, as the release's `WNDB_License.txt` carries it, says: "Permission to use, copy, modify and
distribute this software and database and its documentation for any purpose and without fee or royalty is hereby granted,
provided that you agree to comply with the following copyright notice and statements, including the disclaimer, and that the
same appear on ALL copies of the software, database and documentation, including modifications that you make for internal use
or for distribution." The notice, which every data file also carries:

> WordNet 3.1 Copyright 2011 by Princeton University. All rights reserved.
>
> THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR
> IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION, PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF
> MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE LICENSED SOFTWARE, DATABASE OR DOCUMENTATION WILL
> NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS.
>
> The name of Princeton University or Princeton may not be used in advertising or publicity pertaining to distribution of the
> software and/or database. Title to copyright in this software, database and any associated documentation shall at all times
> remain with Princeton University and LICENSEE agrees to preserve same.

A page that shows these meanings must carry that notice and the credit, for example at its foot: *Meanings from Open English
WordNet (the Open English WordNet team, CC BY 4.0), derived from Princeton WordNet 3.1 (Copyright 2011 Princeton University;
https://wordnet.princeton.edu/license-and-commercial-use).* Nobody named here has reviewed or endorsed this package.

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

`idioms-ja`, `shiritori-ja`, `proverbs-ja` and `yojijukugo-ja` are derived from JMdict in the same way, under the same
licence, and the `elementary` flag of `idioms-ja`, `proverbs-ja` and `yojijukugo-ja` from the grades in KANJIDIC2, which is the
same Group's (https://www.edrdg.org/wiki/index.php/KANJIDIC_Project). In `idioms-ja`, the
rows of kind `idiom` are the entries JMdict itself marks idiomatic; the rows of kind
`expression`, and the choice of which words `shiritori-ja` holds, are this package's own
selection from JMdict, and JMdict's editors did not make them. `proverbs-ja` and `yojijukugo-ja`
hold the entries JMdict itself marks as proverbs (`proverb`) and as four-character compounds
(`yoji`); an entry is left out when JMdict marks any sense vulgar, X-rated, sensitive or
derogatory, or any gloss of it names sex or the sex trade, because these lists turn up in
children's games. The Group's conditions
(https://www.edrdg.org/edrdg/licence.html, read 2026-10-31) ask a page showing words from
these files to acknowledge them on that screen, for example at its foot: *Words from JMdict,
the property of the Electronic Dictionary Research and Development Group, used under the
Group's licence (https://www.edrdg.org/edrdg/licence.html).*

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
