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
    constructor(folderID) {
        this.folder = game.folders.get(folderID);
        let state = this.folder.getFlag('world', 'deckstate');
        if (state == undefined) {
            let cardEntries = this.folder['content'].map(el => el.id);
            this._cards = cardEntries;
            this._state = cardEntries;
            this._discard = [];
            this.updateState().then(() => {
                console.log(`${folderID} state updated!`);
            });
        }
        else {
            let savedState = JSON.parse(state);
            this._state = savedState['state'];
            this._cards = savedState['cards'];
            this._discard = savedState['discard'];
        }
    }
    updateState() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.folder.setFlag('world', 'deckstate', JSON.stringify({
                state: this._state,
                cards: this._cards,
                discard: this._discard
            }));
        });
    }
    /**
     * Shuffles the Current Deck
     */
    shuffle() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let currentIndex = this._state.length, tempVal, randomIndex;
            while (0 != currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                tempVal = this._state[currentIndex];
                this._state[currentIndex] = this._state[randomIndex];
                this._state[randomIndex] = tempVal;
            }
            yield this.updateState();
            resolve(this._state);
        }));
    }
    /**
     * Takes in a Card ID and returns true if the card was discarded.
     * @param cardId JournalEntry ID of the Card you wish you discard that's in this deck
     */
    discardCard(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (this._state.includes(cardId)) {
                    this._state.splice(this._state.indexOf(cardId), 1);
                    this.updateState();
                    resolve(true);
                }
                else {
                    reject(false);
                }
            }));
        });
    }
    /**
     * Empties the Discard Pile and resets the deck to the original state
     */
    resetDeck() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this._state = this._cards;
                this._discard = [];
                yield this.updateState();
                resolve(this._state);
            }));
        });
    }
    /**
     * Returns the next card in the pile
     */
    drawCard() {
        return __awaiter(this, void 0, void 0, function* () {
            let card = this._state.pop();
            yield this.updateState();
            return card;
        });
    }
    /**
     * Wraps the get JournalEntry and GetFlag calls
     * @param cardId the ID of the JournalEntry
     */
    getCardData(cardId) {
        return new Promise((resolve, reject) => {
            let entry = game.journal.get(cardId);
            if (entry == undefined) {
                ui.notifications.error(game.i18n.localize('DECK.ERROR'));
                reject("Card Not Found");
            }
            resolve(entry.getFlag("world", "data"));
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
    init() {
        //reads deck states into memory
        this.decks = {};
        let decksFolders = game.folders.find(el => el.name == "Decks").children.map(el => el.id);
        for (let id of decksFolders) {
            this.decks[id] = new Deck(id);
        }
    }
    /**
     *
     * @param sdf A Zip Object from JSZip
     */
    create(deckfile) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            //If DeckFolder doesn't exist create it
            let DecksFolderID = (_a = game.folders.find(el => el.name == "Decks")) === null || _a === void 0 ? void 0 : _a.id;
            if (!DecksFolderID) {
                DecksFolderID = yield Folder.create({ name: "Decks", type: "JournalEntry", parent: null });
            }
            //Check if File is a SDF File
            if (deckfile.name.split(".")[1] != "zip") {
                reject("Not a Zip File");
            }
            //@ts-ignore
            const deckZip = yield JSZip.loadAsync(deckfile);
            console.log(deckfile);
            if (!deckZip.file("deck.yaml")) {
                reject("Deck.yaml Not Found!");
            }
            //Create a JournalEntry Folder and File Upload Folder for the Deck
            let deckfolderId = (yield Folder.create({ name: deckfile.name.split(".")[0], type: "JournalEntry", parent: DecksFolderID })).id;
            let src = "data";
            //@ts-ignore
            if (typeof ForgeVtt != "undefined" && ForgeVTT.usingTheForge) {
                src = "forgevtt";
            }
            let target = `Decks/${deckfolderId}`;
            let result = yield FilePicker.browse(src, target);
            if (result.target != target) {
                yield FilePicker.createDirectory(src, target, {});
                yield FilePicker.createDirectory(src, target + '/images', {});
            }
            //Create a new deck object
            console.log(deckZip);
            //Read deck.yaml
            const deckyaml = jsyaml.safeLoadAll(yield deckZip.file('deck.yaml').async('string'));
            //For Each Card in Deck.yaml List, Read the Card
            for (let c of deckyaml) {
                let card = c;
                //Upload Image to Folder
                let img = yield deckZip.file(`images/${card.img}`).async('blob');
                yield FilePicker.upload(src, `${target}/images`, new File([img], card.img), {});
                //Create a JournalEntry
                let cardEntry = yield JournalEntry.create({
                    name: card.name,
                    folder: deckfolderId,
                    img: `${target}/images/${card.img}`
                });
                cardEntry.setFlag('world', 'data', JSON.stringify(card.data));
            }
            //DOESN'T DO ANYTHING WITH CARD BACKS YET
            this.decks[deckfolderId] = new Deck(deckfolderId);
            resolve(deckfolderId);
        }));
    }
}
