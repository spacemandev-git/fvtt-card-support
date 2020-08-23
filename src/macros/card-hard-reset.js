//CAUTION: Only use in case of otherwise unresolvable objects.
//Will factory-reset all Card Support data including decks and cards.

//delete all card macros
let mCards = game.macros.filter(macro => macro.getFlag("world","cardID") );
for (let m of mCards) m.delete();

//delete all card journals
let mJes = game.journal.filter(je => je.getFlag("world","cardBack") );
for (let j of mJes) j.delete();

//reset hand and remove cards from hand
ui.cardHotbar.populator.chbResetMacros();

//TO DO: add socket emit to discard all other player's hands too?
//Otherwise, players can manually run the above command.