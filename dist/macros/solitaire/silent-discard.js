for (let mId of ui.cardHotbar.populator.macroMap) {
    if ( game.macros.get(mId) ) {
        const m = game.macros.get(mId);
        const mCardId = m.getFlag("world","cardId");
        const mDeck = game.decks.get( game.journal.get(mCardId).data.folder );    
        //console.debug("Card Hotbar | Discarding card (macro, deck)...");
        //console.debug(m);
        //console.debug(mDeck);
        mDeck.discardCard(mCardId);
        m.delete();
    }
}
ui.cardHotbar.populator.chbResetMacros();