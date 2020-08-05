import {mod_scope} from './constants.js';

Hooks.on('renderTileHUD', (tileHUD, html, options) => {
  console.log(tileHUD);
  console.log(options.flags);

  if(options.flags?.[mod_scope]?.cardID != undefined){
    cardHUD(tileHUD, html, options);
  } else if(options.flags?.[mod_scope]?.deckID != undefined){
    deckHUD();
  }
})

async function cardHUD(tileHUD, html, options) {
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
    return new Promise((resolve, reject) => {
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
        reject(false)
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
    })
  }
  const takeCard = async (td:TileData) => {
    // UI.cardhotbar.populator.addToHand(cardID)
    // Delete this tile
  }
  const discardCard = async(td:TileData) => {
    return new Promise((resolve,reject) => {
      // Add Card to Discard for the Deck
      let deckId = game.journal.get(td.flags[mod_scope].cardID).data['folder'];
      console.log("Deck ID: ", deckId);
      game.decks.get(deckId).discardCard(td.flags[mod_scope].cardID);
      // Delete Tile
      canvas.tiles.get(td._id).delete()
      resolve();
    })
  }
  
}
async function deckHUD() {
  // Draw To Hand
  // Draw to Hand Flipped (?)
  // Show Discard
    // Add Discard Back to Deck
  // Reset Deck
  // Shuffle
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