//outputs the Deck object that macros are currently working with to the console log (press F12)
let mDeck = game.decks.get( game.user.getFlag("world","sdf-deck-cur") );
console.log(mDeck);