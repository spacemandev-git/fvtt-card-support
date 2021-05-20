//returns discard pile to the deck in the current order, such as for a new cycle in Solitaire
let mDeck = game.decks.get(game.user.getFlag("world", "sdf-deck-cur"));
let mDiscard = duplicate(mDeck._discard.reverse());
mDeck._state = mDiscard;
mDeck._discard = [];
