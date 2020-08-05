var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Add the listener to the board html element
Hooks.once("canvasReady", (_) => {
    document.getElementById("board").addEventListener("drop", (event) => __awaiter(this, void 0, void 0, function* () {
        // Try to extract the data (type + src)
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData("text/plain"));
            console.log(event);
            console.log("CardTS: ", data);
            if (data.type == "Folder" && game.decks.get(data.id) != undefined) {
                handleDroppedFolder(data.id, event.x, event.y);
            }
        }
        catch (err) {
            return;
        }
    }));
});
function handleDroppedFolder(folderId, x, y) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let t = canvas.tiles.worldTransform;
            const _x = (x - t.tx) / canvas.stage.scale.x;
            const _y = (y - t.ty) / canvas.stage.scale.y;
            Tile.create({
                img: `modules/sdf-decks/assets/${Math.floor(Math.random() * 10) + 1}.png`,
                x: _x,
                y: _y,
                width: 350,
                height: 400,
                flags: {
                    'sdf-decks': {
                        'deckID': folderId
                    }
                }
            });
            resolve();
        });
    });
}
