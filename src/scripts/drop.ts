import { mod_scope } from "./constants.js";

// Add the listener to the board html element
Hooks.once("canvasReady", (_) => {
  document.getElementById("board").addEventListener("drop", async (event) => {
    // Try to extract the data (type + src)
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      console.log(event);
      console.log("CardTS: ", data);
      if(data.type == "Folder" && game.decks.get(data.id) != undefined){
        handleDroppedFolder(data.id, event.x, event.y);
      }
    } catch (err) {
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
      img: `modules/sdf-decks/assets/${Math.floor(Math.random() * 10) + 1}.png`,
      x: _x,
      y: _y,
      width: 350,
      height: 400,
      flags: {
        [mod_scope]: {
          'deckID': folderId
        }
      }
    })
    resolve();
  })
}