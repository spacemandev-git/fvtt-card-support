import { mod_scope } from "./constants.js";
import {cardHotbarSettings} from '../cardhotbar/scripts/card-hotbar-settings.js'

// Add the listener to the board html element
Hooks.once("canvasReady", () => {
  document.getElementById("board").addEventListener("drop", async (event) => {
    // Try to extract the data (type + src)
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      console.log(data);
      if(data.type == "Folder" && game.decks.get(data.id) != undefined){
        handleDroppedFolder(data.id, event.x, event.y);
      } else if (data.type == "JournalEntry" && game.decks.getByCard(data.id) != undefined){
        handleDroppedCard(data.id, event.clientX, event.clientY, event.altKey)
      } else if (data.type == "Macro" &&  game.decks.getByCard(game.macros.get(data.id).getFlag(mod_scope, "cardID")) != undefined){
        handleDroppedCard(
          game.macros.get(data.id).getFlag(mod_scope, "cardID"),
          event.clientX, 
          event.clientY,
          event.altKey,
          game.macros.get(data.id).getFlag(mod_scope, "sideUp")
        )
        await ui['cardHotbar'].populator.chbUnsetMacro(data.cardSlot);
        game.macros.get(data.id).delete()
      }
    } catch (err) {
      console.error(err)
      return;
    }
  });
});

async function handleDroppedFolder(folderId, x, y){
  return new Promise((resolve, reject) => {
    let t = canvas.tiles.worldTransform;
    const _x = (x - t.tx) / canvas.stage.scale.x
    const _y = (y - t.ty) / canvas.stage.scale.y

    Tile.create({
      name: game.folders.get(folderId).name,
      img: `modules/cardsupport/assets/${Math.floor(Math.random() * 10) + 1}.png`,
      x: _x,
      y: _y,
      width: 350, //2, //350 for tile
      height: 400, //400 for tile
      flags: {
        [mod_scope]: {
          'deckID': folderId
        }
      }
    })
    resolve();
  })
}

async function handleDroppedCard(cardID, x, y, alt, sideUp="front"){
  let imgPath = "";
  if(alt || sideUp == "back"){
    imgPath = game.journal.get(cardID).getFlag(mod_scope, "cardBack")
  } else {
    imgPath = game.journal.get(cardID).data['img']
  }

  // Determine the Tile Size:
  const tex = await loadTexture(imgPath);
  const _width = tex.width;
  const _height = tex.height;

  // Project the tile Position
  let t = canvas.tiles.worldTransform;
  const _x = (x - t.tx) / canvas.stage.scale.x
  const _y = (y - t.ty) / canvas.stage.scale.y

  const cardScale = cardHotbarSettings.getCHBCardScale();
  console.debug(cardScale);
  await Tile.create({
    img: imgPath,
    x: _x,
    y: _y,
    width: _width * cardScale,
    height: _height * cardScale,
    flags: {
      [mod_scope]: {
        "cardID": `${cardID}`,
      }
    }
  })
}