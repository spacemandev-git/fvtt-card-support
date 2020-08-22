/// <reference types="js-yaml" />
import {Card} from './card'
import {mod_scope} from './constants.js';
import { file } from 'jszip';

export class Deck{
  public _cards: string[] // All Cards
  public _discard: string[] // Discard Pile
  public _state: string[] // Current Cards
  public deckID: string
  public deckName: string

  /**
   * Builds a Deck Object
   * @param cardlist List of Journal Entry IDs that correspond to this deck
   */
  constructor(folderID:string){
    this.deckID = game.folders.get(folderID)._id
    this.deckName = game.folders.get(folderID).name
    let state = game.folders.get(folderID).getFlag(mod_scope, 'deckState')
    if(state == undefined){
      console.log("State undefined")
      let cardEntries = game.folders.get(folderID)['content'].map(el=>el.id);

      this._cards = duplicate(cardEntries);
      this._state = duplicate(cardEntries);
      this._discard = [];
      this.updateState().then(()=>{
        console.log(`${folderID} state created!`)
      })
    } else {
      console.log("DeckState Loaded: ", state);
      let stateObj = JSON.parse(state); 
      this._state = stateObj['state']
      this._cards = stateObj['cards']
      this._discard = stateObj['discard']
    }
  }

  private async updateState(){
    await game.folders.get(this.deckID).setFlag(mod_scope, 'deckState', JSON.stringify({
      state: this._state,
      cards: this._cards,
      discard: this._discard
    }))
  }

  
  /**
   * Shuffles the Current Deck
   */
  public shuffle():Promise<string[]>{
    return new Promise(async (resolve,reject) => {
      let currentIndex = this._state.length, tempVal, randomIndex;
      while (0 != currentIndex){
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        tempVal = this._state[currentIndex];
        this._state[currentIndex] = this._state[randomIndex];
        this._state[randomIndex] = tempVal
      }
      await this.updateState();
      resolve(this._state)
    })
  }

  /**
   * Takes in a Card ID and returns true if the card was discarded.
   * @param cardId JournalEntry ID of the Card you wish you discard that's in this deck
   */
  public async discardCard(cardId:string):Promise<string>{
    return new Promise( async (resolve, reject) => {
      //if(this._cards.includes(cardId) && !this._state.includes(cardId)){
      if(this._cards.includes(cardId)){
        //this._state.splice(this._state.indexOf(cardId), 1)
        this._discard.push(cardId);
        await this.updateState();
        resolve(this._discard.toString());
      } else {
        reject("Either this card isn't part of this deck, or it's not been properly drawn yet!");
      }
    })
  }

  /**
   * Empties the Discard Pile and resets the deck to the original state
   */
  public async resetDeck():Promise<string[]> {
    return new Promise(async (resolve, reject)=>{
      this._state = duplicate(this._cards)
      this._discard = []
      //delete placed cards (swap to token when that change is made)
      let tileCards = canvas.tiles.placeables.filter( tile => {
        let cardID = tile.getFlag(mod_scope,"cardID");
        if (cardID) {
          return game.decks.deckCheck(cardID, this.deckID);
        } else {
          return false
        }
      });
      for ( let c of tileCards ) {
        c.delete();
      }
      /* Not ready for primetime, commented out for now.
      //delete all macros temporarily created for deck (also removes cards from all players hands)
      let cardMacros = game.macros.filter( macro => {
          let cardID = macro.getFlag("world","cardID");
          if (cardID) {
              return game.decks.deckCheck(cardID, this.deckID);
          } else {
              return false
          }
      });
      for ( let m of cardMacros ) {
          m.delete();
      }
      ui.cardHotbar.populator.compact();
      //TODO: cleanup ui.cardHotbar.populator.macroMap... the deleted macros/cards are still there "under the hood". Sigh.
      //write chbSynchWithHand maybe, that will force the c
      */
      await this.updateState();
      resolve(this._state)
    })
  }
  
  /**
   * Returns the next card in the pile
   */
  public async drawCard():Promise<string>{
    let card = this._state.pop();
    await this.updateState();
    return card;
  }

  public infinteDraw():string{
    let card = this._state[Math.floor(Math.random() * this._state.length)]
    return card;
  }

  /**
   * Wraps the get JournalEntry and GetFlag calls
   * @param cardId the ID of the JournalEntry
   */
  public getCardData(cardId:string){
    return new Promise((resolve,reject)=>{
      let entry = game.journal.get(cardId);
      if(entry == undefined){
        ui.notifications.error(game.i18n.localize('DECK.ERROR'))
        reject("Card Not Found")
      }
      resolve(entry.getFlag(mod_scope, "cardData"));
    })
  }

  /**
   * Removes a list of cardIDs from the discard pile 
   * @param cardIDs List of Journal Entry IDs to remove from this discard pile 
   */
  public async removeFromDiscard(cardIDs: string[]){
    this._discard = this._discard.map(el=> {
      if(!cardIDs.includes(el)){
        return el;
      }
    }).filter(el => {
      return el != null;
    })
    await this.updateState();
  }


  /**
   * Removes a list of cardsIDs
   * @param cardsIDs list of JournalEntry IDs to remove from the current state
   */
  public async removeFromState(cardsIDs: string[]){
    this._state = this._state.map(el => {
      if(!cardsIDs.includes(el)){
        return el;
      }
    }).filter(el => {
      return el != null;
    })
    await this.updateState();
  }

  /**
   * Adds Cards to the temporary deck state. Reset() will wipe them out
   * @param cardIDs 
   */
  public async addToDeckState(cardIDs:string[]){
    cardIDs.forEach(el=>this._state.push(el))
    await this.updateState()
  }
  
  /**
   * Adds Cards to the permanent deck state. Will also push it to the state
   * @param cardIDs 
   */
  public async addToDeckCards(cardIDs:string[]){
    cardIDs.forEach(el=> {
      this._state.push(el)
      this._cards.push(el)
    })
    await this.updateState()
  }
}

export class Decks{
  private decks: {
    [deckId: string]: Deck
  }

  constructor(){}

  public get(deckId:string){
    return this.decks[deckId]
  }

  /* want to add this function but I can't quite get there. Something like this maybe?
  getName(dName) {
      return Object.fromEntries(Object.entries(this.decks).filter(([key, value]) => dName == deckName 
  }*/

  public getByCard(cardId) {
    //returns the Deck object of the provided cardId
    return this.decks[ game.journal.get(cardId).folder.id ];
  }

  public deckCheck(cardId,deckId) {
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

  public init(){
    //reads deck states into memory
    this.decks = {}
    let decksFolders = game.folders.find(el=>el.name=="Decks")?.children.map(el=>el.id);
    if(decksFolders != null){
      for(let id of decksFolders){
        this.decks[id] = new Deck(id);
      }  
    }
  }

  /**
   * 
   * @param sdf A Zip Object from JSZip
   */
  public create(deckfile:File):Promise<string>{
    return new Promise(async (resolve,reject) => {
      //If DeckFolder doesn't exist create it
      let DecksFolderID = game.folders.find(el=>el.name == "Decks")?.id
      if(!DecksFolderID){
        DecksFolderID = await Folder.create({name: "Decks", type:"JournalEntry", parent: null})
      }

      //Check if File is a SDF File
      if(deckfile.name.split(".")[1] != "zip"){
        reject("Not a Zip File")
      }
      //@ts-ignore
      const deckZip = await JSZip.loadAsync(deckfile);
      console.log(deckfile)
      if(!deckZip.file("deck.yaml")){
        ui.notifications.error("Improper SDF!")
        reject("Deck.yaml Not Found!")
      }

    
      //Create a JournalEntry Folder and File Upload Folder for the Deck
      let deckfolderId = (await Folder.create({name: deckfile.name.split(".")[0], type:"JournalEntry", parent: DecksFolderID})).id
      let src = "data";
      //@ts-ignore
      if(typeof ForgeVtt != "undefined" && ForgeVTT.usingTheForge){
        src = "forgevtt"
      }
      let target = `Decks/${deckfolderId}/`
      let result = await FilePicker.browse(src, target)
      if(result.target != target){
        await FilePicker.createDirectory(src, target, {});
      }
      
      //Create a new deck object
      console.log(deckZip);
      //Read deck.yaml
      const deckyaml = jsyaml.safeLoadAll(await deckZip.file('deck.yaml').async('string'))
      //For Each Card in Deck.yaml List, Read the Card
      for(let c of deckyaml){
        let card = <Card>c;
        //Upload Image to Folder
        let img = await deckZip.file(`images/${card.img}`)?.async('blob')
        let card_back = await deckZip.file(`images/${card.back}`)?.async('blob')
        if(img == undefined || card_back == undefined){
          console.log(card);
          ui.notifications.error(`${card.name} is broken.`)
          continue;
        }
        await uploadFile(target, new File([img], card.img))
        await uploadFile(target, new File([card_back], card.back))
        
        if(!card.qty){card.qty = 1}
        for(let i=0; i< card.qty; i++){
          await JournalEntry.create({
            name: card.name,
            folder: deckfolderId,
            img: target+card.img,
            flags:{
              [mod_scope]: {
                cardData: card.data,
                cardBack: target+card.back,
                cardMacros: {}
              }
            } 
          }) 
        }
      }

      this.decks[deckfolderId] = new Deck(deckfolderId)
      resolve(deckfolderId);      
    })
  }

  /**
   * #param files A list of img files
   */
  public createByImages(deckName:string, files:File[], cardBack: File):Promise<string>{
    return new Promise(async (resolve, reject) => {
      //If DeckFolder doesn't exist create it
      let DecksFolderID = game.folders.find(el=>el.name == "Decks")?.id
      if(!DecksFolderID){
        DecksFolderID = await Folder.create({name: "Decks", type:"JournalEntry", parent: null})
      }

      //Create a JournalEntry Folder and File Upload Folder for the Deck
      let deckfolderId = (await Folder.create({name: deckName, type:"JournalEntry", parent: DecksFolderID})).id
      let src = "data";
      //@ts-ignore
      if(typeof ForgeVtt != "undefined" && ForgeVTT.usingTheForge){
        src = "forgevtt"
      }
      let target = `Decks/${deckfolderId}/`
      let result = await FilePicker.browse(src, target)
      if(result.target != target){
        await FilePicker.createDirectory(src, target, {});
      }

      //uplaod CardBack
      await uploadFile(target, cardBack)

      //Make Cards
      for(let cardFile of files){
        await uploadFile(target, cardFile);
        await JournalEntry.create({
          name: cardFile.name.split(".")[0],
          folder: deckfolderId,
          img: target+cardFile.name,
          flags: {
            [mod_scope]: {
              cardData: {},
              cardBack: target+cardBack.name,
              cardMacros: {}
            }
          }
        })
      }

      this.decks[deckfolderId] = new Deck(deckfolderId);
      resolve();
    })
  }

  /**
   * Creates and appends a card to the given deck
   * @param deckID The ID of the deck
   * @param cardFront The File representing the front of the card
   * @param cardBack The File representing the back of the card
   * @param cardData The yaml corresponding to the data for the card 
   */
  public createCard(deckID:string, cardFront:File, cardBack: File, cardData:string){
    return new Promise( async (resolve, reject) => {
      if(
      game.folders.get(deckID) == undefined || 
      game.folders.get(deckID).getFlag(mod_scope, "deckState") == undefined){
        reject("Deck doesn't exist!")
      }

      let target = `Decks/${deckID}/`
      await uploadFile(target, cardFront);
      await uploadFile(target, cardBack);

      let cardEntry = await JournalEntry.create({
        name: cardFront.name.split(".")[0],
        folder: deckID,
        img: target+cardFront.name,
        flags: {
          [mod_scope]: {
            cardData: jsyaml.safeLoad(cardData),
            cardBack: target+cardBack.name,
            cardMacros: {}
          }
        }
      })

      await game.decks.get(deckID).addToDeckCards([cardEntry._id])
      resolve(cardEntry.id)
    })
  }
}

/**
 * 
 * @param path Should have a / infront of it
 * @param file 
 */
async function uploadFile(path:string, file:File){
  let src = "data";
  //@ts-ignore
  if(typeof ForgeVtt != "undefined" && ForgeVTT.usingTheForge){
    src = "forgevtt"
  }
  let filesInFolder = (await FilePicker.browse(src, path)).files 
  let targetPath = path+file.name
  if(filesInFolder.includes(targetPath)){return;} //don't upload same file multiple times
  await FilePicker.upload(src, path, file, {})
}