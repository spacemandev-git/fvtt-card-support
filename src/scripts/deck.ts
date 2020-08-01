/// <reference types="js-yaml" />
import {Card} from './card'
import {mod_name} from './importer.js';

// Flags
//cardData //on cards
//cardMacros
//cardBack 
//deckState //on folders

export class Deck{
  private _cards: string[] // All Cards
  private _discard: string[] // Discard Pile
  private _state: string[] // Current Cards
  private folder: Folder

  /**
   * Builds a Deck Object
   * @param cardlist List of Journal Entry IDs that correspond to this deck
   */
  constructor(folderID:string){
    this.folder = game.folders.get(folderID)
    let state = this.folder.getFlag(mod_name, 'deckState') 
    if(state == undefined){
      let cardEntries = this.folder['content'].map(el=>el.id)
      this._cards = cardEntries;
      this._state = cardEntries;
      this._discard = [];
      this.updateState().then(()=>{
        console.log(`${folderID} state updated!`)
      })
    } else {
      this._state = state['state']
      this._cards = state['cards']
      this._discard = state['discard']
    }
  }

  private async updateState(){
    await this.folder.setFlag(mod_name, 'deckState', {
      state: this._state,
      cards: this._cards,
      discard: this._discard
    })
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
  public async discardCard(cardId:string):Promise<boolean>{
    return new Promise( async (resolve, reject) => {
      if(this._cards.includes(cardId) && !this._state.includes(cardId)){
        //this._state.splice(this._state.indexOf(cardId), 1)
        this.discard.push(cardId);
        this.updateState();
        resolve(true);
      } else {
        reject(false);
      }
    })
  }

  /**
   * Empties the Discard Pile and resets the deck to the original state
   */
  public async resetDeck():Promise<string[]> {
    return new Promise(async (resolve, reject)=>{
      this._state = this._cards
      this._discard = []
      await this.updateState();
      resolve(this._state)
    })
  }
  
  /**
   * Returns the next card in the pile
   */
  public async drawCard():Promise<string>{
    let card = this._state.pop()
    await this.updateState();
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
      resolve(entry.getFlag(mod_name, "cardData"));
    })
  }

  get deck(){return this._state}
  get discard(){return this._discard}
  get allcards(){return this._cards}
}

export class Decks{
  private decks: {
    [deckId: string]: Deck
  }

  constructor(){}

  public get(deckId:string){
    return this.decks[deckId]
  }

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
        let img = await deckZip.file(`images/${card.img}`).async('blob')
        let card_back = await deckZip.file(`images/${card.back}`).async('blob')
        await uploadFile(target, new File([img], card.img))
        await uploadFile(target, new File([card_back], card.back))
        
        if(!card.qty){card.qty = 1}
        for(let i=0; i< card.qty; i++){
          let cardEntry = await JournalEntry.create({
            name: card.name,
            folder: deckfolderId,
            img: target+card.img 
          }) 
          cardEntry.setFlag(mod_name, 'cardData', card.data) //obj
          cardEntry.setFlag(mod_name, 'cardBack', target+card.back) //str
          cardEntry.setFlag(mod_name, 'cardMacros', {}) //obj 
        }
      }

      this.decks[deckfolderId] = new Deck(deckfolderId)
      resolve(deckfolderId);      
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
  if(filesInFolder.includes(targetPath)){return;}
  await FilePicker.upload(src, path, file, {})
}