var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mod_scope } from './constants.js';
Hooks.on('renderTileHUD', (tileHUD, html, options) => {
    //console.log(tileHUD);
    //console.log(options.flags);
    var _a, _b;
    if (((_b = (_a = options.flags) === null || _a === void 0 ? void 0 : _a[mod_scope]) === null || _b === void 0 ? void 0 : _b.cardID) != undefined) {
        cardHUD(tileHUD, html);
    }
});
function cardHUD(tileHUD, html) {
    return __awaiter(this, void 0, void 0, function* () {
        const handDiv = $('<i class="control-icon fa fa-hand-paper" aria-hidden="true" title="Take"></i>');
        const flipDiv = $('<i class="control-icon fa fa-undo" aria-hidden="true" title="Flip"></i>');
        const discardDiv = $('<i class="control-icon fa fa-trash" aria-hidden="true" title="Discard"></i>');
        html.find('.left').append(handDiv);
        html.find('.left').append(flipDiv);
        html.find('.left').append(discardDiv);
        handDiv.click((ev) => {
            takeCard(tileHUD.object.data);
        });
        flipDiv.click((ev) => {
            flipCard(tileHUD.object.data);
        });
        discardDiv.click((ev) => {
            discardCard(tileHUD.object.data);
        });
        //Embdded Functions
        const flipCard = (td) => __awaiter(this, void 0, void 0, function* () {
            //Create New Tile at Current Tile's X & Y
            let cardEntry = game.journal.get(td.flags[mod_scope].cardID);
            let newImg = "";
            if (td.img == cardEntry.data['img']) {
                // Card if front up, switch to back
                newImg = cardEntry.getFlag(mod_scope, "cardBack");
            }
            else if (td.img == cardEntry.getFlag(mod_scope, "cardBack")) {
                // Card is back up
                newImg = cardEntry.data['img'];
            }
            else {
                ui.notifications.error("What you doing m8? Stop breaking my code");
                return;
            }
            Tile.create({
                img: newImg,
                x: td.x,
                y: td.y,
                width: td.width,
                height: td.height,
                flags: td.flags
            });
            //Delete this tile
            canvas.tiles.get(td._id).delete();
        });
        const takeCard = (td) => __awaiter(this, void 0, void 0, function* () {
            // UI.cardhotbar.populator.addToHand(cardID)
            // Delete this tile
            ui['cardHotbar'].populator.addToHand([td.flags[mod_scope]['cardID']]);
            canvas.tiles.get(td._id).delete();
        });
        const discardCard = (td) => __awaiter(this, void 0, void 0, function* () {
            // Add Card to Discard for the Deck
            let deckId = game.journal.get(td.flags[mod_scope].cardID).data['folder'];
            console.log("Deck ID: ", deckId);
            game.decks.get(deckId).discardCard(td.flags[mod_scope].cardID);
            // Delete Tile
            canvas.tiles.get(td._id).delete();
        });
    });
}
