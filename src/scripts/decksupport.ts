import { Decks } from './deck.js';
import {mod_scope} from './constants.js';

export const log = (...args: any[]) => {
  return console.log(`Deck Importer | ${args}`);
};

Hooks.on("ready", async () => {
  //Creates A "Decks" folder where to unzip SDF Files

  let src = "data";
  //@ts-ignore
  if(typeof ForgeVtt != "undefined" && ForgeVTT.usingTheForge){
    src = "forgevtt"
  }
  let target = 'Decks'
  let result = await FilePicker.browse(src, target)
  if(result.target != target){
    await FilePicker.createDirectory(src, target, {});
  }

  //Registers the Decks Object 
  game.decks = new Decks()
  game.decks.init();

  // If 54CardDeck isn't already created, go ahead and create it
  const sampledeckFolderID = game.folders.find(el => el.name == "54CardDeck")
  if(!sampledeckFolderID){
    console.log("Create Sample Deck")
    let sampleDeckBlob = await (await fetch('modules/cardsupport/sample/54CardDeck/54CardDeck.zip')).blob()
    let sampleDeckFile = new File([sampleDeckBlob], '54CardDeck.zip');
    game.decks.create(sampleDeckFile);
  }
})

Hooks.on("renderMacroDirectory", (macroDir, html, _options) => {
  macroDir.entities.forEach(el => {
    let flag = el.getFlag(mod_scope, 'cardID');
    if(flag){
      let id = el.data._id;
      html.find(`li[data-entity-id="${id}"]`).remove();
    }
  });
})

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
          callback: async (html) => {
            const sdfImportDialog = `
            <div class="form-group" style="display:flex; flex-direction:column">
              <h1 style="flex:2">${game.i18n.localize("DECK.IMPORT_SDF")}</1>
              <input id="file" type="file" />  
            </div>
            `
            new Dialog({
              title: game.i18n.localize("DECK.Dialog_Title"),
              content: sdfImportDialog,
              buttons: {
                ok: {
                  label: game.i18n.localize("DECK.Import_Button"),
                  callback: async (form) => {
                    game.decks.create($(form).find('#file')[0]['files'][0])
                  }
                }, 
                cancel: {
                  label: game.i18n.localize("DECK.Cancel")
                }
              }
            }).render(true)
          }
        },
        images: {
          label: game.i18n.localize("DECK.IMPORT_IMAGES"),
          callback: async (html) => {}
        },
        append: {
          label: game.i18n.localize("DECK.APPEND_CARD"),
          callback: async (html) => {}
        }
      }
    }).render(true)
  })
})