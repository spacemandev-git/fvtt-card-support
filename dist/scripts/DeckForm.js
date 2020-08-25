var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class DeckForm extends FormApplication {
    constructor(obj, opts = {}) {
        super(obj, opts);
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'deckinteractionform',
            title: "Decks",
            template: "modules/cardsupport/templates/deckform.html",
            classes: ['sheet']
        });
    }
    getData() {
        let data = {
            decks: game.decks.decks
        };
        return data;
    }
    activateListeners(html) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let d of Object.values(game.decks.decks)) {
                let deck = d;
                //Draw Card Listener
                html.find(`#${deck.deckID}-draw`).click(() => {
                    let takeDialogTemplate = `
        <div style="display:flex; flex-direction:column">
          <div style="display:flex; flex-direction:row">
            <h2 style="flex:4"> How many cards? </h2>
            <input type="number" id="numCards" value=1 style="width:50px"/>
          </div>
          <div style="display:flex; flex-direction:row">
            <h2 style="flex:4"> Draw with Replacement? </h2>
            <input type="checkbox" id="infiniteDraw"  style="flex:1"/>
          </div>
          <input style="display:none" id="deckID" value=${deck.deckID} />
        </div>     
        `;
                    new Dialog({
                        title: "Draw Cards",
                        content: takeDialogTemplate,
                        buttons: {
                            draw: {
                                label: "Draw",
                                callback: (html) => {
                                    if (game.user.isGM) {
                                        game.decks.get(html.find("#deckID")[0].value).dealToPlayer(game.user.id, html.find("#numCards")[0].value, html.find("#infiniteDraw")[0].checked);
                                    }
                                    else {
                                        let msg = {
                                            type: "DRAWCARDS",
                                            playerID: game.users.find(el => el.isGM && el.active).id,
                                            receiverID: game.user.id,
                                            deckID: html.find("#deckID")[0].value,
                                            numCards: html.find("#numCards")[0].value,
                                            replacement: html.find("#infiniteDraw")[0].value
                                        };
                                        //@ts-ignore
                                        game.socket.emit('module.cardsupport', msg);
                                    }
                                }
                            }
                        }
                    }).render(true);
                });
            }
        });
    }
}
