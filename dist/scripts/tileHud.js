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
    var _a, _b, _c, _d, _e, _f;
    console.log(tileHUD);
    console.log(options.flags);
    if (((_b = (_a = options.flags) === null || _a === void 0 ? void 0 : _a[mod_scope]) === null || _b === void 0 ? void 0 : _b.cardID) != undefined) {
        cardHUD(tileHUD, html);
    }
    else if (((_d = (_c = options.flags) === null || _c === void 0 ? void 0 : _c[mod_scope]) === null || _d === void 0 ? void 0 : _d.deckID) != undefined) {
        deckHUD((_f = (_e = options.flags) === null || _e === void 0 ? void 0 : _e[mod_scope]) === null || _f === void 0 ? void 0 : _f.deckID, html);
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
function deckHUD(deckID, html) {
    return __awaiter(this, void 0, void 0, function* () {
        // Draw To Hand
        // Draw to Hand Flipped (?)
        const handDiv = $('<i class="control-icon fa fa-hand-paper" aria-hidden="true" title="Draw"></i>');
        html.find(".left").append(handDiv);
        handDiv.click((ev) => draw());
        // Show Discard
        // Add Discard Back to Deck
        const discardDiv = $('<i class="control-icon fa fa-trash" aria-hidden="true" title="Discard Pile"></i>');
        html.find(".left").append(discardDiv);
        discardDiv.click((ev) => showDiscard());
        // Reset Deck
        const resetDiv = $('<i class="control-icon fa fa-undo" aria-hidden="true" title="Reset Deck (Original state, unshuffled, with all cards)"></i>');
        html.find(".left").append(resetDiv);
        resetDiv.click((ev) => resetDeck());
        // Shuffle
        const shuffleDiv = $('<i class="control-icon fa fa-random" aria-hidden="true" title="Shuffle"></i>');
        html.find(".left").append(shuffleDiv);
        shuffleDiv.click((ev) => shuffleDeck());
        const viewDiv = $('<i class="control-icon fa fa-eye" aria-hidden="true" title="Shuffle"></i>');
        html.find(".left").append(viewDiv);
        viewDiv.click(ev => viewDeck());
        let deck = game.decks.get(deckID);
        let deckName = game.folders.get(deckID).data.name;
        //Embedded Functions
        const draw = () => __awaiter(this, void 0, void 0, function* () {
            // Ask How many cards they want to draw, default 1
            // Tick Box to Draw to Table
            if (ui['cardHotbar'].getNextSlot() == -1) {
                ui.notifications.error("No more room in your hand");
                return;
            }
            let card = yield deck.drawCard();
            ui['cardHotbar'].populator.addToHand([card]);
        });
        const showDiscard = () => __awaiter(this, void 0, void 0, function* () {
            let discardPile = [];
            for (let card of deck._discard) {
                discardPile.push(game.journal.get(card));
            }
            new DiscardPile({ pile: discardPile, deck: deck }, {}).render(true);
        });
        const resetDeck = () => __awaiter(this, void 0, void 0, function* () {
            deck.resetDeck();
            ui.notifications.info(`${deckName} was reset to it's original state.`);
        });
        const shuffleDeck = () => __awaiter(this, void 0, void 0, function* () {
            deck.shuffle();
            ui.notifications.info(`${deckName} has ${deck._state.length} cards which were shuffled successfully!`);
        });
        const viewDeck = () => __awaiter(this, void 0, void 0, function* () {
            //ask how many cards they want to view, default value all cards
        });
    });
}
class DiscardPile extends FormApplication {
    constructor(object, options = {}) {
        super(object, options);
        this.pile = object['pile'];
        this.deck = object['deck'];
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "discardpile",
            title: "Discard Pile",
            template: "modules/cardsupport/templates/cardgrid.html",
            classes: ["sheet"],
            height: 600,
            width: 600,
        });
    }
    getData() {
        let data = {
            cards: this.pile
        };
        return data;
    }
    activateListeners(html) {
        return __awaiter(this, void 0, void 0, function* () {
            html.find('#close').click((ev) => {
                this.close();
            });
            html.find("#shuffleBack").click((ev) => {
                game.decks.get(this.deck.deckID).addToDeck(this.pile.map(el => el._id));
                game.decks.get(this.deck.deckID).removeFromDiscard(this.pile.map(el => el._id));
                game.decks.get(this.deck.deckID).shuffle();
                this.pile = [];
                this.render(true);
            });
            // Take
            for (let card of this.pile) {
                html.find(`#${card._id}-take`).click((ev) => {
                    if (ui['cardHotbar'].getNextSlot() == -1) {
                        ui.notifications.error("No more room in your hand");
                        return;
                    }
                    ui['cardHotbar'].populator.addToHand([card._id]);
                    game.decks.get(this.deck.deckID).removeFromDiscard([card._id]);
                    this.pile = this.pile.filter(el => { return el._id != card._id; });
                    this.render(true);
                });
            }
            // Burn
            for (let card of this.pile) {
                html.find(`#${card._id}-burn`).click((ev) => {
                    game.decks.get(this.deck.deckID).removeFromDiscard([card._id]);
                    ui.notifications.info(`${card._id} was removed from discard!`);
                    this.pile = this.pile.filter(el => { return el._id != card._id; });
                    this.render(true);
                });
            }
            // Top Of Deck
            for (let card of this.pile) {
                html.find(`#${card._id}-topdeck`).click((ev) => {
                    game.decks.get(this.deck.deckID).addToDeck([card._id]);
                    game.decks.get(this.deck.deckID).removeFromDiscard([card._id]);
                    this.pile = this.pile.filter(el => { return el._id != card._id; });
                    this.render(true);
                });
            }
        });
    }
    _updateObject(evt, data) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
