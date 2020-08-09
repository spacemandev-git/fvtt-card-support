import {mod_scope} from './constants.js';
import { Deck } from './deck.js';

Hooks.on('renderTileHUD', (tileHUD, html, options) => {
  console.log(tileHUD);
  console.log(options.flags);

  if(options.flags?.[mod_scope]?.cardID != undefined){
    cardHUD(tileHUD, html);
  } else if(options.flags?.[mod_scope]?.deckID != undefined){
    deckHUD(options.flags?.[mod_scope]?.deckID, html);
  }
})

async function cardHUD(tileHUD, html) {
  const handDiv = $('<i class="control-icon fa fa-hand-paper" aria-hidden="true" title="Take"></i>')
  const flipDiv = $('<i class="control-icon fa fa-undo" aria-hidden="true" title="Flip"></i>')
  const discardDiv = $('<i class="control-icon fa fa-trash" aria-hidden="true" title="Discard"></i>')

  html.find('.left').append(handDiv);
  html.find('.left').append(flipDiv);
  html.find('.left').append(discardDiv);

  handDiv.click((ev) => {
    takeCard(tileHUD.object.data)
  })

  flipDiv.click((ev) => {
    flipCard(tileHUD.object.data)
  })

  discardDiv.click((ev) => {
    discardCard(tileHUD.object.data)
  })

  //Embdded Functions
  const flipCard = async (td:TileData) => {
    //Create New Tile at Current Tile's X & Y
    let cardEntry = game.journal.get(td.flags[mod_scope].cardID)
    let newImg = "";
    
    if(td.img == cardEntry.data['img']){
      // Card if front up, switch to back
      newImg = cardEntry.getFlag(mod_scope, "cardBack")
    } else if(td.img == cardEntry.getFlag(mod_scope, "cardBack")){
      // Card is back up
      newImg = cardEntry.data['img']
    } else{ 
      ui.notifications.error("What you doing m8? Stop breaking my code");
      return;
    }
    Tile.create({
      img: newImg,
      x: td.x,
      y: td.y,
      width: td.width,
      height: td.height, 
      flags: td.flags
    })

    //Delete this tile
    canvas.tiles.get(td._id).delete();
  }
  const takeCard = async (td:TileData) => {
    // UI.cardhotbar.populator.addToHand(cardID)
    // Delete this tile
    ui['cardHotbar'].populator.addToHand([td.flags[mod_scope]['cardID']])
    canvas.tiles.get(td._id).delete();
  }
  const discardCard = async(td:TileData) => {
    // Add Card to Discard for the Deck
    let deckId = game.journal.get(td.flags[mod_scope].cardID).data['folder'];
    console.log("Deck ID: ", deckId);
    game.decks.get(deckId).discardCard(td.flags[mod_scope].cardID);
    // Delete Tile
    canvas.tiles.get(td._id).delete()
  }
}
async function deckHUD(deckID:string, html) {
  // Draw To Hand
    // Draw to Hand Flipped (?)
  const handDiv = $('<i class="control-icon fa fa-hand-paper" aria-hidden="true" title="Draw"></i>')
  html.find(".left").append(handDiv)
  handDiv.click((ev) => draw())
  // Show Discard
    // Add Discard Back to Deck
  const discardDiv = $('<i class="control-icon fa fa-trash" aria-hidden="true" title="Discard Pile"></i>')
  html.find(".left").append(discardDiv)
  discardDiv.click((ev) => showDiscard())
  // Reset Deck
  const resetDiv = $('<i class="control-icon fa fa-undo" aria-hidden="true" title="Reset Deck (Original state, unshuffled, with all cards)"></i>')
  html.find(".left").append(resetDiv)
  resetDiv.click((ev) => resetDeck())
  // Shuffle
  const shuffleDiv = $('<i class="control-icon fa fa-random" aria-hidden="true" title="Shuffle"></i>')
  html.find(".left").append(shuffleDiv)
  shuffleDiv.click((ev) => shuffleDeck())

  const viewDiv = $('<i class="control-icon fa fa-eye" aria-hidden="true" title="Shuffle"></i>')
  html.find(".left").append(viewDiv);
  viewDiv.click(ev => viewDeck())

  let deck = (<Deck>game.decks.get(deckID))
  let deckName = game.folders.get(deckID).data.name

  //Embedded Functions
  const draw = async () => {
    // Ask How many cards they want to draw, default 1
    // Tick Box to Draw to Table

    if(ui['cardHotbar'].populator.getNextSlot() == -1){
      ui.notifications.error("No more room in your hand")
      return;
    }
    let card = await deck.drawCard();
    ui['cardHotbar'].populator.addToHand([card]);
  }

  const showDiscard = async () => {
    let discardPile:JournalEntry[] = []
    for(let card of deck._discard){
      discardPile.push(game.journal.get(card));
    }
    new DiscardPile({pile: discardPile, deck: deck}, {}).render(true)
  }

  const resetDeck = async ()=> {
    deck.resetDeck();
    ui.notifications.info(`${deckName} was reset to it's original state.`)
  }
  const shuffleDeck = async() => {
    deck.shuffle();
    ui.notifications.info(`${deckName} has ${deck._state.length} cards which were shuffled successfully!`)
  }

  const viewDeck = async() => {
    //ask how many cards they want to view, default value all cards
    let template = `
    <div>
      <p> 
        <h3> How many cards do you want to view? </h3> 
        <input id="cardNum" value=${deck._state.length} type="number" style='width:50px;'/> 
      </p>
    </div>
    `
    new Dialog({
      title: "View Cards",
      content: template,
      buttons: {
        ok: {
          label: "View",
          callback: async (html:any) => {
            new ViewPile({
              deckID: deck.deckID,
              viewNum: html.find("#cardNum")[0].value
            }, {}).render(true);
          }
        }
      }
    }).render(true)
  }
}


interface TileData {
  flags: {
    [scope:string]: any
  }, 
  height: number,
  hidden: boolean,
  img: string,
  locaked: boolean,
  rotation: number,
  scale: number,
  width: number,
  x: number, 
  y: number,
  z: number,
  _id: string
}


class DiscardPile extends FormApplication {
  pile: JournalEntry[];
  deck: Deck; 

  constructor(object, options = {}){
    super(object, options);
    this.pile = object['pile'];
    this.deck = object['deck'];
  }
  
  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: "discardpile",
      title: "Discard Pile",
      template: "modules/cardsupport/templates/cardgrid.html",
      classes: ["sheet"],
      height: 600,
      width: 600,
    })
  }

  getData(){
    let data = {
      cards: this.pile,
      discard: true
    }
    return data;
  }

  async activateListeners(html){
    html.find('#close').click(() => {
      this.close();
    })

    html.find("#shuffleBack").click(() => {
      let cardIds = this.pile.map(el => el._id);
      console.log(cardIds);
      (<Deck>game.decks.get(this.deck.deckID)).addToDeck(cardIds);
      (<Deck>game.decks.get(this.deck.deckID)).removeFromDiscard(cardIds);
      (<Deck>game.decks.get(this.deck.deckID)).shuffle();
      this.pile = [];
      this.render(true);
    })

    // Take
    for(let card of this.pile){
      html.find(`#${card._id}-take`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToHand([card._id]);
        (<Deck>game.decks.get(this.deck.deckID)).removeFromDiscard([card._id]);
        this.pile = this.pile.filter(el=>{return el._id != card._id})
        this.render(true);
      })
    }

    // Burn
    for(let card of this.pile){
      html.find(`#${card._id}-burn`).click(() => {
        (<Deck>game.decks.get(this.deck.deckID)).removeFromDiscard([card._id]);
        ui.notifications.info(`${card._id} was removed from discard!`)
        this.pile = this.pile.filter(el=>{return el._id != card._id})
        this.render(true);
      })
    }

    // Top Of Deck
    for(let card of this.pile){
      html.find(`#${card._id}-topdeck`).click(() => {
        (<Deck>game.decks.get(this.deck.deckID)).addToDeck([card._id]);
        (<Deck>game.decks.get(this.deck.deckID)).removeFromDiscard([card._id]);
        this.pile = this.pile.filter(el=>{return el._id != card._id})
        this.render(true);
      })
    }
  }
}

class ViewPile extends FormApplication {
  deckID: string = "";
  viewNum: number = 0;

  constructor(obj, opts = {}){
    super(obj, opts)
    this.deckID = obj['deckID']
    this.viewNum = obj['viewNum']
  }

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: "viewpile",
      title: "View Deck",
      template: "modules/cardsupport/templates/cardgrid.html",
      classes: ['sheet'],
    })
  }
  getData() {
    let deck =(<Deck>game.decks.get(this.deckID))
    let cardIDs = deck._state.slice(deck._state.length - this.viewNum)

    let data = {
      cards: cardIDs.map(el => {
        return game.journal.get(el)
      }).reverse(),
      discard: false
    }
    return data;
  }

  async activateListeners(html){
    let deck =(<Deck>game.decks.get(this.deckID))
    let cardIDs = deck._state.slice(deck._state.length - this.viewNum)

    // Take
    for(let card of cardIDs){
      html.find(`#${card}-take`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToHand([card]);
        (<Deck>game.decks.get(this.deckID)).removeFromState([card]);
        this.close();
      })
    }
  }
}