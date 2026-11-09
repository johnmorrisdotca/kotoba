# Accessibility

A word game is played by sight and by keyboard, so the board carries each of them in words and in shapes.

- **A mark is never told by colour alone.** Each cell carries a shape in its corner: ● right place, ◐ elsewhere in the word, ≈ the same row of the kana table, ○ not in the word, and an arrow when a kana's size (↓) or its mark (↑) is wrong. A person who cannot tell green from orange reads the shape.
- **A screen reader hears every place.** Each row is labelled with its number and each cell with its letter and what it earned (right place, elsewhere, not in the word), built from the same words as the legend, in English or Japanese by `locale`. The status line (`aria-live="polite"`) says what a guess did, and why a word was not taken.
- **The keyboard is a keyboard.** The device's own keys type, Backspace erases and Enter sends. The keys on the screen never take the focus, so a person using a physical keyboard is never moved off the page by tapping one.
- **Touch targets are large.** Each key on the screen is at least 48 pixels high, and the demo's browser test checks that everything to press on its page is at least 44 pixels in each direction, at phone width, with touch.
- **Motion.** The board has no animation, so a request for reduced motion changes nothing and nothing needs to be turned off.
- **Colour and contrast.** The board carries its own background and so looks the same in light and dark; the colours are the variables under [Theming](../README.md#theming). The defaults have not been measured against a contrast standard, and a page that changes them keeps the shapes, which do not depend on them.
- **Known to fall short.** The Japanese words of the board have not been read by a native reader ([Languages](../README.md#languages)), and a kana board's romaji typing is unfamiliar to anyone who types kana another way.
