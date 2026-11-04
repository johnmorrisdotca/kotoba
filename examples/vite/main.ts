import "@johnmorrisdotca/kotoba/element/define";

const game = document.querySelector("kotoba-game")!;
game.addEventListener("kotoba-finish", (event) => console.log((event as CustomEvent).detail.status));
