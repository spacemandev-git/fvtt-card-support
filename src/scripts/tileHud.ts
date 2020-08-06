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
  const handDiv = $('<i class="control-icon fa fa-hand-paper" aria-hidden="true" title="Take"></i>')
  html.find(".left").append(handDiv)
  handDiv.click((ev) => drawToHand())
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

  let deck = (<Deck>game.decks.get(deckID))
  let deckName = game.folders.get(deckID).data.name

  //Embedded Functions
  const drawToHand = async () => {
    if(ui['cardHotbar'].getNextSlot() == -1){
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
    let template = await renderTemplate('modules/sdf-decks/templates/cardgrid.html', {cards: discardPile})
    console.log(template)
    console.log(discardPile)
    new Dialog({
      title: "Discard Pile",
      content: template,
      buttons: {
        ok: {
          label: "Close"
        }, 
        ShuffleBack: {
          label: "Shuffle Discard back into the deck"
        }
      }
    }, {width: 600, height: 500}).render(true);
  }

  const resetDeck = async ()=> {
    deck.resetDeck();
    ui.notifications.info(`${deckName} was reset to it's original state.`)
  }
  const shuffleDeck = async() => {
    deck.shuffle();
    ui.notifications.info(`${deckName} has ${deck._state.length} cards which were shuffled successfully!`)
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