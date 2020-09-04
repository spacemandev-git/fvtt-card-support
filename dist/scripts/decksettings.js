var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Hooks.on("decks.ready", () => {
    //Go through game.decks and make and register a setting for each one
    for (let deckID of Object.keys(game.decks.decks)) {
        game.settings.register("cardsupport", `${deckID}-settings`, {
            config: false,
            scope: "world",
            type: Object,
            default: {
                "deckImg": "",
                "drawCards": [],
                "viewDeck": [],
                "viewDiscard": []
            }
        });
    }
    game.settings.registerMenu('cardsupport', 'decksettings', {
        name: "Deck Settings for Players",
        label: "Deck Settings",
        type: DeckSettingsForm,
        restricted: true
    });
});
class DeckSettingsForm extends FormApplication {
    constructor(object, options = {}) {
        super(object, options);
    }
    getData() {
        return {
            decks: game.decks.decks
        };
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "decksettingsform",
            title: "Deck Settings",
            template: "modules/cardsupport/templates/decksettingsform.hbs"
        });
    }
    activateListeners(html) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let deckID of Object.keys(game.decks.decks)) {
                html.find(`#${deckID}-draw`).click((ev) => {
                    let playersettings = '';
                    for (let player of Array.from(game.users)) {
                        if (player['isGM']) {
                            continue;
                        }
                        let playerID = player['_id'];
                        if (game.settings.get('cardsupport', `${deckID}-settings`)['drawCards'].includes(playerID)) {
                            playersettings += `
            <p style="display:flex">
            <span  style="flex: 2">${game.users.get(playerID).name}</span> 
            <input style="flex: 1" id=${playerID} type="checkbox" checked/>
            </p>`;
                        }
                        else {
                            playersettings += `
            <p style="display:flex">
            <span  style="flex: 2">${game.users.get(playerID).name}</span> 
            <input style="flex: 1" id=${playerID} type="checkbox" />
            </p>`;
                        }
                    }
                    let diaglogTemplate = `
        ${playersettings}
        `;
                    new Dialog({
                        title: `${game.decks.get(deckID).deckName} Draw Settings`,
                        content: diaglogTemplate,
                        buttons: {
                            save: {
                                label: "Save",
                                callback: (html) => __awaiter(this, void 0, void 0, function* () {
                                    let oldSettings = game.settings.get('cardsupport', `${deckID}-settings`);
                                    let drawCardsSettings = [];
                                    for (let player of Array.from(game.users)) {
                                        if (player['isGM']) {
                                            continue;
                                        }
                                        if (html.find(`#${player['_id']}`)[0].checked) {
                                            drawCardsSettings.push(player['_id']);
                                        }
                                    }
                                    game.settings.set('cardsupport', `${deckID}-settings`, {
                                        drawCards: drawCardsSettings,
                                        deckImg: oldSettings.deckImg,
                                        viewDeck: oldSettings.viewDeck,
                                        viewDiscard: oldSettings.viewDiscard
                                    });
                                })
                            }
                        }
                    }).render(true);
                });
                html.find(`#${deckID}-view`).click((ev) => {
                    let playersettings = '';
                    for (let player of Array.from(game.users)) {
                        if (player['isGM']) {
                            continue;
                        }
                        let playerID = player['_id'];
                        if (game.settings.get('cardsupport', `${deckID}-settings`)['viewDeck'].includes(playerID)) {
                            playersettings += `
            <p style="display:flex">
            <span  style="flex: 2">${game.users.get(playerID).name}</span> 
            <input style="flex: 1" id=${playerID} type="checkbox" checked/>
            </p>`;
                        }
                        else {
                            playersettings += `
            <p style="display:flex">
            <span  style="flex: 2">${game.users.get(playerID).name}</span> 
            <input style="flex: 1" id=${playerID} type="checkbox" />
            </p>`;
                        }
                    }
                    let diaglogTemplate = `
        ${playersettings}
        `;
                    new Dialog({
                        title: `${game.decks.get(deckID).deckName} View Settings`,
                        content: diaglogTemplate,
                        buttons: {
                            save: {
                                label: "Save",
                                callback: (html) => __awaiter(this, void 0, void 0, function* () {
                                    let oldSettings = game.settings.get('cardsupport', `${deckID}-settings`);
                                    let viewCardsSettings = [];
                                    for (let player of Array.from(game.users)) {
                                        if (player['isGM']) {
                                            continue;
                                        }
                                        if (html.find(`#${player['_id']}`)[0].checked) {
                                            viewCardsSettings.push(player['_id']);
                                        }
                                    }
                                    game.settings.set('cardsupport', `${deckID}-settings`, {
                                        drawCards: oldSettings.drawCards,
                                        deckImg: oldSettings.deckImg,
                                        viewDeck: viewCardsSettings,
                                        viewDiscard: oldSettings.viewDiscard
                                    });
                                })
                            }
                        }
                    }).render(true);
                });
                html.find(`#${deckID}-discard`).click((ev) => {
                    let playersettings = '';
                    for (let player of Array.from(game.users)) {
                        let playerID = player['_id'];
                        if (player['isGM']) {
                            continue;
                        }
                        if (game.settings.get('cardsupport', `${deckID}-settings`)['viewDiscard'].includes(playerID)) {
                            playersettings += `
            <p style="display:flex">
            <span  style="flex: 2">${game.users.get(playerID).name}</span> 
            <input style="flex: 1" id=${playerID} type="checkbox" checked/>
            </p>`;
                        }
                        else {
                            playersettings += `
            <p style="display:flex">
            <span  style="flex: 2">${game.users.get(playerID).name}</span> 
            <input style="flex: 1" id=${playerID} type="checkbox" />
            </p>`;
                        }
                    }
                    let diaglogTemplate = `
        ${playersettings}
        `;
                    new Dialog({
                        title: `${game.decks.get(deckID).deckName} Discard Settings`,
                        content: diaglogTemplate,
                        buttons: {
                            save: {
                                label: "Save",
                                callback: (html) => __awaiter(this, void 0, void 0, function* () {
                                    let oldSettings = game.settings.get('cardsupport', `${deckID}-settings`);
                                    let discardCardsSettings = [];
                                    for (let player of Array.from(game.users)) {
                                        if (player['isGM']) {
                                            continue;
                                        }
                                        if (html.find(`#${player['_id']}`)[0].checked) {
                                            discardCardsSettings.push(player['_id']);
                                        }
                                    }
                                    game.settings.set('cardsupport', `${deckID}-settings`, {
                                        drawCards: oldSettings.drawCards,
                                        deckImg: oldSettings.deckImg,
                                        viewDeck: oldSettings.viewDeck,
                                        viewDiscard: discardCardsSettings
                                    });
                                })
                            }
                        }
                    }).render(true);
                });
            }
        });
    }
}
// Default Image
// Draw Cards
// View Deck
// View Discard
