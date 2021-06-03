import { Decks } from "./deck.js";
import { mod_scope } from "./constants.js";

export const log = (...args) => {
  return console.log(`Deck Importer | ${args}`);
};

Hooks.on("ready", async () => {
  game.settings.register("cardsupport", "decks", {
    scope: "world",
    config: false,
    type: String,
    default: "{}",
  });

  game.settings.register("cardsupport", "chatMessageOnPlayerAction", {
    name: "Chat Message on Player Action (SNITCH)",
    hint: "Prints chat messages when the players use the Hotbar GUI to interact with Decks to prevent cheating.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  //Creates A "Decks" folder where to unzip SDF Files
  let src = "data";
  //@ts-ignore
  if (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) {
    src = "forgevtt";
  }
  let target = `worlds/${game.world.data.name}/Decks`;
  //check for directory and create it if not found
  try {
    let result = await FilePicker.browse(src, target)
    }
    catch(err) {
      console.log("error caught, directory does not exist");
      await FilePicker.createDirectory(src, target, {});
    }

  //Registers the Decks Object
  game.decks = new Decks();
  game.decks.init();

  // If 54CardDeck isn't already created, go ahead and create it
  const sampledeckFolderID = game.folders.find((el) => el.data.name == "54CardDeck");
  if (!sampledeckFolderID && game.user.isGM) {
    console.log("Create Sample Deck");
    let sampleDeckBlob = await (
      await fetch("modules/cardsupport/sample/54CardDeck/54CardDeck.zip")
    ).blob();
    let sampleDeckFile = new File([sampleDeckBlob], "54CardDeck.zip");
    let deckImgBlob = await (
      await fetch(`modules/cardsupport/assets/5.png`)
    ).blob();
    let deckImgFile = new File([deckImgBlob], "deckimg.png");
    game.decks.create(sampleDeckFile, deckImgFile);
  }
});

Hooks.on("renderMacroDirectory", (macroDir, html, _options) => {
  macroDir.entities.forEach((el) => {
    let flag = el.getFlag(mod_scope, "cardID");
    if (flag) {
      let id = el.data._id;
      html.find(`li[data-entity-id="${id}"]`).remove();
    }
  });
});

Hooks.on("renderJournalDirectory", (_app, html, _data) => {
  const deckImportButton = $(
    `<button class="importButton">${game.i18n.localize(
      "DECK.Import_Button"
    )}</button>`
  );
  html.find(".directory-footer").append(deckImportButton);

  deckImportButton.click((ev) => {
    new Dialog(
      {
        title: game.i18n.localize("DECK.Dialog_Title"),
        content: "",
        buttons: {
          sdf: {
            label: game.i18n.localize("DECK.IMPORT_SDF"),
            callback: async () => {
              const sdfImportDialog = `
            <div class="form-group" style="display:flex; flex-direction:column">
              <h1 style="flex:2">${game.i18n.localize("DECK.IMPORT_SDF")}</h1>
              <input id="file" type="file" />
              <p> Deck Img:    <input id="deckImg" type="file" /> </p>  
            </div>
            `;
              new Dialog({
                title: game.i18n.localize("DECK.Dialog_Title"),
                content: sdfImportDialog,
                buttons: {
                  ok: {
                    label: game.i18n.localize("DECK.Import_Button"),
                    callback: async (form) => {
                      game.decks.create(
                        $(form).find("#file")[0]["files"][0],
                        $(form).find("#deckImg")[0]["files"][0]
                      );
                    },
                  },
                  cancel: {
                    label: game.i18n.localize("DECK.Cancel"),
                  },
                },
              }).render(true);
            },
          },
          images: {
            label: game.i18n.localize("DECK.IMPORT_IMAGES"),
            callback: async () => {
              let imagesDialog = `
              <h2> ${game.i18n.localize("DECK.IMPORT_IMAGES")} </h2>
              <p> Deck Name:   <input id="deckName" type="text" value="Deck Name"/></p>
              <p> Card Images: <input id="cardFiles" type="file" multiple="multiple" /> </p>
              <p> Card Back:   <input id="cardBack" type="file" /> </p>
              <p> Deck Img:    <input id="deckImg" type="file" /> </p>
            `;
              new Dialog({
                title: game.i18n.localize("DECK.IMPORT_IMAGES"),
                content: imagesDialog,
                buttons: {
                  import: {
                    label: game.i18n.localize("DECK.IMPORT_IMAGES"),
                    callback: async (html) => {
                      game.decks.createByImages(
                        html.find("#deckName")[0].value,
                        html.find("#cardFiles")[0].files,
                        html.find("#cardBack")[0].files[0],
                        html.find("#deckImg")[0].files[0]
                      );
                    },
                  },
                },
              }).render(true);
            },
          },
          append: {
            label: game.i18n.localize("DECK.APPEND_CARD"),
            callback: async () => {
              let deckList = "";
              for (let key of Object.keys(game.decks.decks)) {
                deckList += `<option value=${key}>${
                  game.folders.get(key).name
                }</option>`;
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
                    callback: async (html) => {
                      await game.decks.createCard(
                        html.find("#deck")[0].value,
                        html.find("#img")[0].files[0],
                        html.find("#back")[0].files[0],
                        html.find("#data")[0].value
                      );
                    },
                  },
                },
              }).render(true);
            },
          },
          convertToRollTable: {
            label: game.i18n.localize("DECK.CONVERT_ROLLTABLE"),
            callback: async () => {
              let deckList = "";
              for (let key of Object.keys(game.decks.decks)) {
                deckList += `<option value=${key}>${
                  game.folders.get(key).name
                }</option>`;
              }

              let rollTableDialog = `
            <h2>${game.i18n.localize("DECK.CONVERT_ROLLTABLE")}</h2>
            <select id="deck">${deckList}</select>
            `;
              new Dialog({
                title: game.i18n.localize("DECK.CONVERT_ROLLTABLE"),
                content: rollTableDialog,
                buttons: {
                  convert: {
                    label: game.i18n.localize("DECK.CONVERT_ROLLTABLE"),
                    callback: async (html) => {
                      let tableEntries = [];
                      let journalEntries = game.folders.get(
                        html.find("#deck")[0].value
                      )["content"];
                      for (let i = 0; i < journalEntries.length; i++) {
                        tableEntries[i] = {
                          type: 1, // Entity
                          collection: "JournalEntry",
                          text: journalEntries[i].data.name,
                          img: journalEntries[i].data.img,
                          range: [i + 1, i + 1],
                        };
                      }

                      let rTable = RollTable.create({
                        name: game.folders.get(html.find("#deck")[0].value)
                          .name,
                        results: tableEntries,
                        formula: `1d${tableEntries.length}`,
                      });
                    },
                  },
                },
              }).render(true);
            },
          },
        },
      },
      {
        id: "importDialog",
      }
    ).render(true);
  });
});
