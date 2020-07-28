export class Deck{
  private _cards: string[] // All Cards
  private _discard: string[] // Discard Pile
  private _state: string[] // Current Cards


  /**
   * Builds a Deck Object
   * @param cardlist List of Journal Entry IDs that correspond to this deck
   */
  constructor(cardlist:string[]){
    this._cards = cardlist;
    this._state = cardlist;
  }

  /**
   * Shuffles the Current Deck
   */
  public shuffle():Promise<string[]>{
    return new Promise((resolve,reject) => {
      let currentIndex = this._state.length, tempVal, randomIndex;
      while (0 != currentIndex){
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        tempVal = this._state[currentIndex];
        this._state[currentIndex] = this._state[randomIndex];
        this._state[randomIndex] = tempVal
      }
      resolve(this._state)
    })
  }

  /**
   * Takes in a Card ID and returns true if the card was discarded.
   * @param cardId JournalEntry ID of the Card you wish you discard that's in this deck
   */
  public async discardCard(cardId:string):Promise<boolean>{
    return new Promise( (resolve, reject) => {
      if(this._state.includes(cardId)){
        this._state.splice(this._state.indexOf(cardId), 1)
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
    return new Promise((resolve, reject)=>{
      this._state = this._cards
      this._discard = []
      resolve(this._state)
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

  public create(cardlist:string[]):Promise<string>{
    return new Promise((resolve,reject) => {
      //Should I check if all cardList ids are valid JournalEntry IDs?
      const newDeckID = randomID();
      this.decks[newDeckID] = new Deck(cardlist);
      resolve(newDeckID)
    })
  }
}
