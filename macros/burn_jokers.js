//finds, discards, and then removes from discard pile ("burns") both jokers for games that do not use them.
let mDeck = game.decks.get(game.user.getFlag("world", "sdf-deck-cur"));
let errMsg = "";

if (!mDeck) errMsg = "Please use the Set Macro Deck macro to pick a deck.";

let redJoker = game.journal.getName("red_joker");
let blackJoker = game.journal.getName("black_joker");

if (errMsg == "") {
  if (!redJoker) {
    ui.notifications.notify("Red Joker not found.");
  } else {
    if (!game.decks.deckCheck(redJoker.id, mDeck.deckID))
      ui.notifications.notify("Red Joker not found in macro deck.");
  }

  if (!blackJoker) {
    ui.notifications.notify("Black Joker not found.");
  } else {
    if (!game.decks.deckCheck(blackJoker.id, mDeck.deckID))
      ui.notifications.notify("Black Joker not found in macro deck.");
  }
  discardJokers();
  mDeck.removeFromDiscard(redJoker.id);
  mDeck.removeFromDiscard(blackJoker.id);
}

function discardJokers() {
  mDeck.discardCard(redJoker.id);
  mDeck._state.splice(mDeck._state.indexOf(redJoker.id), 1);
  mDeck.discardCard(blackJoker.id);
  mDeck._state.splice(mDeck._state.indexOf(blackJoker.id), 1);
}

if (errMsg != "") ui.notifications.error(errMsg);
