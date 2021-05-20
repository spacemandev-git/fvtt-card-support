//You can make variants of this macro with X as different numbers
let x = 1;
let newCards = [];
let mDeck =  game.decks.get( game.user.getFlag("world", "sdf-deck-cur") );
let errMsg = "";

if(!mDeck) errMsg = "Please use the Set Macro Deck macro to define a valid deck to draw from";

if (errMsg == "") {
    drawHandler();
}

if (errMsg != "") ui.notifications.error(errMsg);

async function drawHandler() {
    newCards = await drawX(x);
    console.log("Drew the following cards:");
    console.log(newCards);
    if (newCards.length ==0) errMsg = "Could not draw any cards.";
    if (newCards.length < x ) errMsg = "Could not draw all card(s) requested.";
}

async function drawX( x ) {
    let c = {};
    let cards = [];
    for(let i=0; i<x; i++) {
        c = await mDeck.drawCard(); 
        console.log ( c );      
        if (c) cards.push( c );
    }
    if (cards.length > 0) {
        console.log(cards);
        ui.cardHotbar.populator.addToHand(cards);
        return cards;
    } else {
        return [];
    }
}