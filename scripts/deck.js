import { mod_scope } from "./constants.js";
export class Deck {
  /**
   * Builds a Deck Object
   * @param cardlist List of Journal Entry IDs that correspond to this deck
   */
  constructor(folderID) {
    this.deckID = game.folders.get(folderID)._id;
    this.deckName = game.folders.get(folderID).data.name;
    let state = game.folders.get(folderID).getFlag(mod_scope, "deckState");
    if (state == undefined) {
      let cardEntries = game.folders
        .get(folderID)
        ["content"].map((el) => el.id);
      this._cards = duplicate(cardEntries);
      this._state = duplicate(cardEntries);
      this._discard = [];
      this.updateState().then(() => {
        console.log(`${folderID} state created!`);
      });
    } else {
      let stateObj = JSON.parse(state);
      this._state = stateObj["state"];
      this._cards = stateObj["cards"];
      this._discard = stateObj["discard"];
    }
  }
  /**
   * Used to update the flags with the current state of the deck
   */
  async updateState() {
    if (game.user.isGM) {
      await game.folders.get(this.deckID).setFlag(
        mod_scope,
        "deckState",
        JSON.stringify({
          state: this._state,
          cards: this._cards,
          discard: this._discard,
        })
      );
      await game.settings.set(
        "cardsupport",
        "decks",
        JSON.stringify(game.decks.decks)
      );
      //@ts-ignore
      for (let user of game.users.entities) {
        if (user.isSelf) {
          continue;
        }
        //@ts-ignore
        game.socket.emit("module.cardsupport", {
          type: "SETDECKS",
          playerID: user.id,
        });
      }
    } else {
      let msg = {
        type: "UPDATESTATE",
        playerID: game.users.find((el) => el.isGM && el.data.active).id,
        deckID: this.deckID,
      };
      //@ts-ignore
      game.socket.emit("module.cardsupport", msg);
    }
  }
  /**
   * Shuffles the Current Deck
   */
  shuffle() {
    return new Promise(async (resolve, reject) => {
      let currentIndex = this._state.length,
        tempVal,
        randomIndex;
      while (0 != currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        tempVal = this._state[currentIndex];
        this._state[currentIndex] = this._state[randomIndex];
        this._state[randomIndex] = tempVal;
      }
      await this.updateState();
      resolve(this._state);
    });
  }
  /**
   * Takes in a Card ID and returns true if the card was discarded.
   * @param cardId JournalEntry ID of the Card you wish you discard that's in this deck
   */
  async discardCard(cardId) {
    return new Promise(async (resolve, reject) => {
      //if(this._cards.includes(cardId) && !this._state.includes(cardId)){
      if (this._cards.includes(cardId)) {
        //this._state.splice(this._state.indexOf(cardId), 1)
        this._discard.push(cardId);
        await this.updateState();
        resolve(this._discard.toString());
      } else {
        reject(
          "Either this card isn't part of this deck, or it's not been properly drawn yet!"
        );
      }
    });
  }
  /**
   * Empties the Discard Pile and resets the deck to the original state
   */
  async resetDeck() {
    return new Promise(async (resolve, reject) => {
      this._state = duplicate(this._cards);
      this._discard = [];
      //delete placed cards
      let tileCards = canvas.tiles.placeables
        .filter((tile) => {
          let cardId = tile.getFlag(mod_scope, "cardID");
          if (cardId) {
            return game.decks.deckCheck(cardId, this.deckID);
          } else {
            return false;
          }
        })
        .map((t) => t.data._id);
      await canvas.scene.deleteEmbeddedEntity("Tile", tileCards);
      //@ts-ignore
      for (let user of game.users.entries) {
        if (user.isSelf) {
          ui["cardHotbar"].populator.resetDeck(this.deckID);
        } else {
          let resetMsg = {
            type: "RESETDECK",
            playerID: user.id,
            deckID: this.deckID,
          };
          //@ts-ignore
          game.socket.emit("module.cardsupport", resetMsg);
        }
      }
      await this.updateState();
      resolve(this._state);
    });
  }
  /**
   * Returns the next card in the pile
   */
  async drawCard() {
    let card = this._state.pop();
    await this.updateState();
    return card;
  }
  infinteDraw() {
    let card = this._state[Math.floor(Math.random() * this._state.length)];
    return card;
  }
  /**
   * Wraps the get JournalEntry and GetFlag calls
   * @param cardId the ID of the JournalEntry
   */
  getCardData(cardId) {
    return new Promise((resolve, reject) => {
      let entry = game.journal.get(cardId);
      if (entry == undefined) {
        ui.notifications.error(game.i18n.localize("DECK.ERROR"));
        reject("Card Not Found");
      }
      resolve(entry.getFlag(mod_scope, "cardData"));
    });
  }
  /**
   * Removes a list of cardIDs from the discard pile
   * @param cardIDs List of Journal Entry IDs to remove from this discard pile
   */
  async removeFromDiscard(cardIDs) {
    this._discard = this._discard
      .map((el) => {
        if (!cardIDs.includes(el)) {
          return el;
        }
      })
      .filter((el) => {
        return el != null;
      });
    await this.updateState();
  }
  /**
   * Removes a list of cardsIDs
   * @param cardsIDs list of JournalEntry IDs to remove from the current state
   */
  async removeFromState(cardsIDs) {
    this._state = this._state
      .map((el) => {
        if (!cardsIDs.includes(el)) {
          return el;
        }
      })
      .filter((el) => {
        return el != null;
      });
    await this.updateState();
  }
  /**
   * Adds Cards to the temporary deck state. Reset() will wipe them out
   * @param cardIDs
   */
  async addToDeckState(cardIDs) {
    cardIDs.forEach((el) => this._state.push(el));
    await this.updateState();
  }
  /**
   * Adds Cards to the permanent deck state. Will also push it to the state
   * @param cardIDs
   */
  async addToDeckCards(cardIDs) {
    cardIDs.forEach((el) => {
      this._state.push(el);
      this._cards.push(el);
    });
    await this.updateState();
  }
  /**
   * Deals cards to players. GM only.
   * @param playerID the player ID to deal cards too
   * @param numCards number of cards to deal
   * @param replacement if you want to deal with replacement or not
   */
  async dealToPlayer(playerID, numCards, replacement = false) {
    return new Promise(async (resolve, reject) => {
      if (game.users.get(playerID) == undefined) {
        reject("Player not found.");
      }
      if (!game.user.isGM) {
        reject("Only GMs can deal to players");
      }
      let cards = [];
      for (let i = 0; i < numCards; i++) {
        if (replacement) {
          cards.push(game.journal.get(this.infinteDraw()));
        } else {
          cards.push(game.journal.get(await this.drawCard()));
        }
      }
      if (game.user.id == playerID) {
        ui["cardHotbar"].populator.addToPlayerHand(cards);
      } else {
        let msg = {
          type: "DEAL",
          playerID: playerID,
          cards: cards,
        };
        //@ts-ignore
        game.socket.emit("module.cardsupport", msg);
      }
      resolve();
    });
  }
}
export class Decks {
  constructor() {}
  get(deckId) {
    return this.decks[deckId];
  }
  /* want to add this function but I can't quite get there. Something like this maybe?
    getName(dName) {
        return Object.fromEntries(Object.entries(this.decks).filter(([key, value]) => dName == deckName
    }*/
  /**
   * Returns the Deck ID given a CardID. To get around journal permissions, it doesn't use journal, just runs through the deck array
   * @param cardId
   */
  getByCard(cardId) {
    //returns the Deck object of the provided cardId
    //return this.decks[ game.journal.get(cardId).folder.id ];
    for (let deck of Object.values(this.decks)) {
      let card = deck._cards.find((el) => el == cardId);
      if (card) {
        return deck;
      }
    }
    return undefined;
  }
  deckCheck(cardId, deckId) {
    return this.getByCard(cardId).deckID == deckId;
  }
  /* Functions to add later deckState doesn't quite work)
    deckStateCheck(cardId,deckId) {
        return this.get(deckId)._state.filter(card => {
            card == cardId;
        });
    }
  
    deckDiscardCheck(cardId,deckId) {
        return this.get(deckId)._state.filter(card => {
            card == cardId;
        });
    }
  
    deckHandCheck(cardId,deckId) {
        //returns true if the specified card is in the player's hand
    } */
  init() {
    //reads deck states into memory
    this.decks = {};
    if (game.user.isGM) {
      let decksFolders = game.folders
        .find((el) => el.data.name == "Decks")
        ?.children.map((el) => el.id);
      if (decksFolders != null) {
        for (let id of decksFolders) {
          this.decks[id] = new Deck(id);
        }
      }
      game.settings.set("cardsupport", "decks", JSON.stringify(this.decks));
    } else {
      this.decks = JSON.parse(game.settings.get("cardsupport", "decks"));
    }
    Hooks.call("decks.ready");
  }
  /**
   *
   * @param sdf A Zip Object from JSZip
   */
  create(deckfile, deckImg) {
    return new Promise(async (resolve, reject) => {
      //If DeckFolder doesn't exist create it
      let DecksFolderID = game.folders.find((el) => el.data.name == "Decks")?.id;
      if (!DecksFolderID) {
        DecksFolderID = await Folder.create({
          name: "Decks",
          type: "JournalEntry",
          parent: null,
        });
      }
      //Check if File is a SDF File
      if (deckfile.name.split(".")[1] != "zip") {
        reject("Not a Zip File");
      }
      //@ts-ignore
      const deckZip = await JSZip.loadAsync(deckfile);
      console.log(deckfile);
      if (!deckZip.file("deck.yaml")) {
        ui.notifications.error("Improper SDF!");
        reject("Deck.yaml Not Found!");
      }
      //Create a JournalEntry Folder and File Upload Folder for the Deck
      let deckfolderId = (
        await Folder.create({
          name: deckfile.name.split(".")[0],
          type: "JournalEntry",
          parent: DecksFolderID,
        })
      ).id;
      let src = "data";
      //@ts-ignore
      if (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) {
        src = "forgevtt";
      }
      let target = `worlds/${game.world.data.name}/Decks/${deckfolderId}/`;
      
      //check for directory and create it if not found
      try {
      let result = await FilePicker.browse(src, target)
      }
      catch(err) {
        console.log("error caught, directory does not exist");
        await FilePicker.createDirectory(src, target, {});
      }


      //Deal with Deck Img
      let deckImgPath = await uploadFile(target, deckImg);
      //Register the setting for the new deck
      game.settings.register("cardsupport", `${deckfolderId}-settings`, {
        config: false,
        scope: "world",
        type: Object,
        default: {
          deckImg: deckImgPath,
          drawCards: [],
          viewDeck: [],
          viewDiscard: [],
        },
      });
      //Create a new deck object
      //Read deck.yaml
      const deckyaml = jsyaml.safeLoadAll(
        await deckZip.file("deck.yaml").async("string")
      );
      //For Each Card in Deck.yaml List, Read the Card
      for (let c of deckyaml) {
        let card = c;
        //Upload Image to Folder
        let img = await deckZip.file(`images/${card.img}`)?.async("blob");
        let card_back = await deckZip
          .file(`images/${card.back}`)
          ?.async("blob");
        if (img == undefined || card_back == undefined) {
          console.log(card);
          ui.notifications.error(`${card.name} is broken.`);
          continue;
        }
        let imgPath = await uploadFile(target, new File([img], card.img));
        let backPath = await uploadFile(
          target,
          new File([card_back], card.back)
        );
        if (!card.qty) {
          card.qty = 1;
        }
        for (let i = 0; i < card.qty; i++) {
          await JournalEntry.create({
            name: card.name,
            folder: deckfolderId,
            img: imgPath,
            flags: {
              [mod_scope]: {
                cardData: card.data,
                cardBack: backPath,
                cardMacros: {},
              },
            },
          });
        }
      }
      this.decks[deckfolderId] = new Deck(deckfolderId);
      ui.notifications.info("Finished Uploading Deck!");
      resolve(deckfolderId);
    });
  }
  /**
   * #param files A list of img files
   */
  createByImages(deckName, files, cardBack, deckImg) {
    return new Promise(async (resolve, reject) => {
      //If DeckFolder doesn't exist create it
      let DecksFolderID = game.folders.find((el) => el.data.name == "Decks")?.id;
      if (!DecksFolderID) {
        DecksFolderID = await Folder.create({
          name: "Decks",
          type: "JournalEntry",
          parent: null,
        });
      }
      //Create a JournalEntry Folder and File Upload Folder for the Deck
      let deckfolderId = (
        await Folder.create({
          name: deckName,
          type: "JournalEntry",
          parent: DecksFolderID,
        })
      ).id;
      let src = "data";
      //@ts-ignore
      if (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) {
        src = "forgevtt";
      }
      let target = `worlds/${game.world.data.name}/Decks/${deckfolderId}/`;
      let result = await FilePicker.browse(src, target);
      if (result.target != target) {
        await FilePicker.createDirectory(src, target, {});
      }
      //Deal with Deck Img
      let deckImgPath = await uploadFile(target, deckImg);
      //Register the setting for the new deck
      game.settings.register("cardsupport", `${deckfolderId}-settings`, {
        config: false,
        scope: "world",
        type: Object,
        default: {
          deckImg: deckImgPath,
          drawCards: [],
          viewDeck: [],
          viewDiscard: [],
        },
      });
      //uplaod CardBack
      let cardBackPath = await uploadFile(target, cardBack);
      //Make Cards
      for (let cardFile of files) {
        let imgPath = await uploadFile(target, cardFile);
        await JournalEntry.create({
          name: cardFile.name.split(".")[0],
          folder: deckfolderId,
          img: imgPath,
          flags: {
            [mod_scope]: {
              cardData: {},
              cardBack: cardBackPath,
              cardMacros: {},
            },
          },
        });
      }
      this.decks[deckfolderId] = new Deck(deckfolderId);
      ui.notifications.info("Finished Uploading Deck!");
      resolve();
    });
  }
  /**
   * Creates and appends a card to the given deck
   * @param deckID The ID of the deck
   * @param cardFront The File representing the front of the card
   * @param cardBack The File representing the back of the card
   * @param cardData The yaml corresponding to the data for the card
   */
  createCard(deckID, cardFront, cardBack, cardData) {
    return new Promise(async (resolve, reject) => {
      if (
        game.folders.get(deckID) == undefined ||
        game.folders.get(deckID).getFlag(mod_scope, "deckState") == undefined
      ) {
        reject("Deck doesn't exist!");
      }
      let target = `Decks/${deckID}/`;
      await uploadFile(target, cardFront);
      await uploadFile(target, cardBack);
      let cardEntry = await JournalEntry.create({
        name: cardFront.name.split(".")[0],
        folder: deckID,
        img: target + cardFront.name,
        flags: {
          [mod_scope]: {
            cardData: jsyaml.safeLoad(cardData),
            cardBack: target + cardBack.name,
            cardMacros: {},
          },
        },
      });
      await game.decks.get(deckID).addToDeckCards([cardEntry._id]);
      resolve(cardEntry.id);
    });
  }
  giveToPlayer(playerID, cardID) {
    if (!game.user.isGM) {
      console.error("This function can only be called by the GM");
      return;
    }
    let msg = {
      type: "DEAL",
      playerID: playerID,
      cards: [game.journal.get(cardID)],
    };
    //@ts-ignore
    game.socket.emit("module.cardsupport", msg);
  }
}
/**
 *
 * @param path Should have a / infront of it
 * @param file
 */
async function uploadFile(path, file) {
  let src = "data";
  //@ts-ignore
  if (typeof ForgeVTT != "undefined" && ForgeVTT.usingTheForge) {
    src = "forgevtt";
  }
  let filesInFolder = (await FilePicker.browse(src, path)).files;
  let targetPath = path + file.name;
  if (filesInFolder.includes(targetPath)) {
    return targetPath;
  } //don't upload same file multiple times
  //@ts-ignore
  return (await FilePicker.upload(src, path, file, {})).path;
}
