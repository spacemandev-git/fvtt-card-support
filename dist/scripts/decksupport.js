var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Decks } from './deck.js';
import { mod_scope } from './constants.js';
export const log = (...args) => {
    return console.log(`Deck Importer | ${args}`);
};
Hooks.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    //Creates A "Decks" folder where to unzip SDF Files
    let src = "data";
    //@ts-ignore
    if (typeof ForgeVtt != "undefined" && ForgeVTT.usingTheForge) {
        src = "forgevtt";
    }
    let target = 'Decks';
    let result = yield FilePicker.browse(src, target);
    if (result.target != target) {
        yield FilePicker.createDirectory(src, target, {});
    }
    //Registers the Decks Object 
    game.decks = new Decks();
    game.decks.init();
    // If 54CardDeck isn't already created, go ahead and create it
    const sampledeckFolderID = game.folders.find(el => el.name == "54CardDeck");
    if (!sampledeckFolderID) {
        console.log("Create Sample Deck");
        let sampleDeckBlob = yield (yield fetch('modules/cardsupport/sample/54CardDeck/54CardDeck.zip')).blob();
        let sampleDeckFile = new File([sampleDeckBlob], '54CardDeck.zip');
        game.decks.create(sampleDeckFile);
    }
}));
Hooks.on('renderJournalDirectory', (_app, html, _data) => {
    const deckImportButton = $(`<button class="importButton">${game.i18n.localize("DECK.Import_Button")}</button>`);
    html.find(".directory-footer").append(deckImportButton);
    const deckImportDialog = `
  <div class="form-group" style="display:flex; flex-direction:column">
    <h1 style="flex:2">${game.i18n.localize("DECK.Dialog_Title")}</1>
    <input id="file" type="file" />  
  </div>
  `;
    deckImportButton.click((ev) => {
        new Dialog({
            title: game.i18n.localize("DECK.Dialog_Title"),
            content: deckImportDialog,
            buttons: {
                ok: {
                    label: game.i18n.localize("DECK.Import_Button"),
                    callback: (form) => __awaiter(void 0, void 0, void 0, function* () {
                        game.decks.create($(form).find('#file')[0]['files'][0]);
                    })
                },
                cancel: {
                    label: game.i18n.localize("DECK.Cancel")
                }
            }
        }).render(true);
    });
});
Hooks.on("renderMacroDirectory", (macroDir, html, _options) => {
    macroDir.entities.forEach(el => {
        let flag = el.getFlag(mod_scope, 'cardID');
        if (flag) {
            let id = el.data._id;
            html.find(`li[data-entity-id="${id}"]`).remove();
        }
    });
});
