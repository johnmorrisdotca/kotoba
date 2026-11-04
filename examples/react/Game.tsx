import "@johnmorrisdotca/kotoba/element/define";

export function Game({ words = "en", letters = 5 }: { words?: string; letters?: number }) {
  return <kotoba-game words={words} letters={String(letters)} daily="today" />;
}
