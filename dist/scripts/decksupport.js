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
Hooks.on("renderMacroDirectory", (macroDir, html, _options) => {
    macroDir.entities.forEach(el => {
        let flag = el.getFlag(mod_scope, 'cardID');
        if (flag) {
            let id = el.data._id;
            html.find(`li[data-entity-id="${id}"]`).remove();
        }
    });
});
Hooks.on('renderJournalDirectory', (_app, html, _data) => {
    const deckImportButton = $(`<button class="importButton">${game.i18n.localize("DECK.Import_Button")}</button>`);
    html.find(".directory-footer").append(deckImportButton);
    deckImportButton.click(ev => {
        new Dialog({
            title: game.i18n.localize("DECK.Dialog_Title"),
            content: "",
            buttons: {
                sdf: {
                    label: game.i18n.localize("DECK.IMPORT_SDF"),
                    callback: () => __awaiter(void 0, void 0, void 0, function* () {
                        const sdfImportDialog = `
            <div class="form-group" style="display:flex; flex-direction:column">
              <h1 style="flex:2">${game.i18n.localize("DECK.IMPORT_SDF")}</1>
              <input id="file" type="file" />  
            </div>
            `;
                        new Dialog({
                            title: game.i18n.localize("DECK.Dialog_Title"),
                            content: sdfImportDialog,
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
                    })
                },
                images: {
                    label: game.i18n.localize("DECK.IMPORT_IMAGES"),
                    callback: () => __awaiter(void 0, void 0, void 0, function* () {
                        let imagesDialog = `
              <h2> ${game.i18n.localize("DECK.IMPORT_IMAGES")} </h2>
              <p> Deck Name:   <input id="deckName" type="text" value="Deck Name"/></p>
              <p> Card Images: <input id="cardFiles" type="file" multiple="multiple" /> </p>
            `;
                        new Dialog({
                            title: game.i18n.localize("DECK.IMPORT_IMAGES"),
                            content: imagesDialog,
                            buttons: {
                                import: {
                                    label: game.i18n.localize("DECK.IMPORT_IMAGES"),
                                    callback: (html) => __awaiter(void 0, void 0, void 0, function* () {
                                        game.decks.createByImages(html.find("#deckName")[0].value, html.find("#cardFiles")[0].files);
                                    })
                                }
                            }
                        }).render(true);
                    })
                },
                append: {
                    label: game.i18n.localize("DECK.APPEND_CARD"),
                    callback: () => __awaiter(void 0, void 0, void 0, function* () {
                        let deckList = "";
                        for (let key of Object.keys(game.decks.decks)) {
                            deckList += `<option value=${key}>${game.folders.get(key).name}</option>`;
                        }
                        const appendDialog = `
              <h2>${game.i18n.localize("DECK.APPEND_CARD")}</h2>
              <select id="deck">${deckList}</select>
              <p>Card Img:  <input id="img"  type="file" /></p>
              <p>Card Back: <input id="back" type="file" /></p>
              <p>Data:      <textarea id="data" type="text" style="height:200px; overflow-y:scroll"></textarea></p>
            `;
                        new Dialog({
                            title: game.i18n.localize("DECK.APPEND_CARD"),
                            content: appendDialog,
                            buttons: {
                                append: {
                                    label: game.i18n.localize("DECK.APPEND_CARD"),
                                    callback: (html) => __awaiter(void 0, void 0, void 0, function* () {
                                        yield game.decks.createCard(html.find("#deck")[0].value, html.find("#img")[0].files[0], html.find("#back")[0].files[0], html.find("#data")[0].value);
                                    })
                                }
                            }
                        }).render(true);
                    })
                },
                convertToRollTable: {
                    label: game.i18n.localize("DECK.CONVERT_ROLLTABLE"),
                    callback: () => __awaiter(void 0, void 0, void 0, function* () {
                        let deckList = "";
                        for (let key of Object.keys(game.decks.decks)) {
                            deckList += `<option value=${key}>${game.folders.get(key).name}</option>`;
                        }
                        let rollTableDialog = `
            <h2>${game.i18n.localize('DECK.CONVERT_ROLLTABLE')}</h2>
            <select id="deck">${deckList}</select>
            `;
                        new Dialog({
                            title: game.i18n.localize('DECK.CONVERT_ROLLTABLE'),
                            content: rollTableDialog,
                            buttons: {
                                convert: {
                                    label: game.i18n.localize("DECK.CONVERT_ROLLTABLE"),
                                    callback: (html) => __awaiter(void 0, void 0, void 0, function* () {
                                        let tableEntries = [];
                                        let journalEntries = game.folders.get(html.find('#deck')[0].value)['content'];
                                        for (let i = 0; i < journalEntries.length; i++) {
                                            tableEntries[i] = {
                                                type: 1,
                                                collection: "JournalEntry",
                                                text: journalEntries[i].data.name,
                                                img: journalEntries[i].data.img,
                                                range: [i + 1, i + 1]
                                            };
                                        }
                                        let rTable = RollTable.create({
                                            name: game.folders.get(html.find('#deck')[0].value).name,
                                            results: tableEntries,
                                            formula: `1d${tableEntries.length}`
                                        });
                                    })
                                }
                            }
                        }).render(true);
                    })
                }
            }
        }, {
            id: "importDialog"
        }).render(true);
    });
});
