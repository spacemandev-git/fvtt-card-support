import {importDeck} from './sdf.js';

export const log = (...args) => console.log("Deck Importer | " + args);

Hooks.on('renderJournalDirectory', (app, html, data) => {
  const deckImportButton = $(`<button class="importButton">${game.i18n.localize("DECK.Import_Button")}</button>`);
  html.find(".directory-footer").append(deckImportButton);

  const deckImportDialog = `
  <div class="form-group" style="display:flex; flex-direction:column">
    <h1 style="flex:2">${game.i18n.localize("DECK.Dialog_Title")}</1>
    <input id="file" type="file" />  
  </div>
  `
  
  deckImportButton.click( (ev) => {
    new Dialog({
      title: game.i18n.localize("DECK.Dialog_Title"),
      content: deckImportDialog,
      buttons: {
        ok: {
          label: game.i18n.localize("DECK.Import_Button"),
          callback: async (form) => {
            importDeck($(form).find('#file')[0]['files'][0])
          }
        }, 
        cancel: {
          label: game.i18n.localize("DECK.Cancel")
        }
      }
    }).render(true)
  })
})