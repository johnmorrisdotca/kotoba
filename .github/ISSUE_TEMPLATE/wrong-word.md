---
name: A word that is wrong
about: A word that should not be on a list (a name, a brand, a slur, not a word of the language), or a common word that is missing
title: "Word: "
labels: bug
---

**The word, and the list** (English, French, German, Japanese kana or Pop; and its length):

**Is it on the list and should not be, or missing and should be?**

**Why:** what a real dictionary of the language says. A word is a word only if one does, so a link to the entry is the most useful thing you can give.

**Where it matters** (a puzzle's answer, or only a word that may be guessed):

Every list is machine output, made by a script in `scripts/` from a dictionary, so a word is added or removed by changing the script's rules, not the list. English comes from SCOWL, French from Lexique, German from LanguageTool's dictionary and Japanese from JMdict; if the word is wrong in the source, it is the source that has to change.
