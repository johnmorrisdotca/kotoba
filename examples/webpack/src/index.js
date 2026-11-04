import "@johnmorrisdotca/kotoba/element/define";

const game = document.createElement("kotoba-game");
game.setAttribute("words", "en");
game.setAttribute("letters", "5");
game.setAttribute("daily", "today");
document.body.append(game);
