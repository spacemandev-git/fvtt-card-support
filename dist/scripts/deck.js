var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Deck {
    /**
     * Builds a Deck Object
     * @param cardlist List of Journal Entry IDs that correspond to this deck
     */
    constructor(cardlist) {
        this._cards = cardlist;
        this._state = cardlist;
    }
    /**
     * Shuffles the Current Deck
     */
    shuffle() {
        return new Promise((resolve, reject) => {
            let currentIndex = this._state.length, tempVal, randomIndex;
            while (0 != currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                tempVal = this._state[currentIndex];
                this._state[currentIndex] = this._state[randomIndex];
                this._state[randomIndex] = tempVal;
            }
            resolve(this._state);
        });
    }
    /**
     * Takes in a Card ID and returns true if the card was discarded.
     * @param cardId JournalEntry ID of the Card you wish you discard that's in this deck
     */
    discardCard(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this._state.includes(cardId)) {
                    this._state.splice(this._state.indexOf(cardId), 1);
                    resolve(true);
                }
                else {
                    reject(false);
                }
            });
        });
    }
    /**
     * Empties the Discard Pile and resets the deck to the original state
     */
    resetDeck() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._state = this._cards;
                this._discard = [];
                resolve(this._state);
            });
        });
    }
    get deck() { return this._state; }
    get discard() { return this._discard; }
    get allcards() { return this._cards; }
}
export class Decks {
    constructor() { }
    get(deckId) {
        return this.decks[deckId];
    }
    create(cardlist) {
        return new Promise((resolve, reject) => {
            //Should I check if all cardList ids are valid JournalEntry IDs?
            const newDeckID = randomID();
            this.decks[newDeckID] = new Deck(cardlist);
            resolve(newDeckID);
        });
    }
}
