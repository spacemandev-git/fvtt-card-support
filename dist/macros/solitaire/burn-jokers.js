//removes both jokers from the deck for games that do not use them
let mDeck = game.decks.get( game.user.getFlag("world","sdf-deck-cur") );
let errMsg = "";

if(!mDeck) errMsg = "Please use the Set Macro Deck macro to pick a deck.";

//really not sure why this doesn't work.

//more sophistication is needed if more than one deck/journal entry has a card of this name.
let redJoker = game.journal.getName("red_joker");
let blackJoker = game.journal.getName("black_joker");

if(!redJoker) ui.notifications.notify("Red Joker not found.");
if(!blackJoker) ui.notifications.notify("Red Joker not found.");

if(errMsg != "") {
    async () => {
        await discardJokers()
    };
    mDeck.removeFromDiscard(redJoker._id);
    mDeck.removeFromDiscard(blackJoker._id);
}

async function discardJokers() {
    await mDeck.discardCard(redJoker._id);       
    await mDeck.discardCard(blackJoker._id);
}

if(errMsg != "") ui.notifications.error(errMsg);