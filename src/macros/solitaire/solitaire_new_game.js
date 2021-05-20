//configures the macro deck to start a new game of solitaire
//finds, discards, and then removes from discard pile ("burns") both jokers for games that do not use them.
let mDeck = game.decks.get(game.user.getFlag("world", "sdf-deck-cur"));
let errMsg = "";

if (!mDeck) errMsg = "Please use the Set Macro Deck macro to pick a deck.";

if (errMsg == "") {
  //prepare deck
  ui.cardHotbar.populator.chbResetMacros();
  mDeck.resetDeck();
  //if jokers are present remove them from the deck
  game.macros.getName("Burn Jokers").execute();
  mDeck.shuffle();

  (async () => {
    await game.user.setFlag("cardsupport", "chbDrawFaceUp", false);
    let newCards = [];
    newCards = await drawX(28);
    await game.user.setFlag("cardsupport", "chbDrawFaceUp", true);
  })();
}

if (errMsg != "") ui.notifications.error(errMsg);

async function drawX(x) {
  let c = {};
  let cards = [];
  for (let i = 0; i < x; i++) {
    c = await mDeck.drawCard();
    console.log(c);
    if (c) cards.push(c);
  }
  if (cards.length > 0) {
    console.log(cards);
    ui.cardHotbar.populator.addToHand(cards);
    return cards;
  } else {
    return [];
  }
}
