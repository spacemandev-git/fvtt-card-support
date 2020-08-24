var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mod_scope } from "./constants.js";
import { cardHotbarSettings } from '../cardhotbar/scripts/card-hotbar-settings.js';
// Add the listener to the board html element
Hooks.once("canvasReady", () => {
    document.getElementById("board").addEventListener("drop", (event) => __awaiter(void 0, void 0, void 0, function* () {
        // Try to extract the data (type + src)
        let data;
        try {
            if (!game.user.isGM) {
                ui.notifications.error("Only GMs can create Tiles, sorry :(");
                return;
            }
            data = JSON.parse(event.dataTransfer.getData("text/plain"));
            console.log(data);
            if (data.type == "Folder" && game.decks.get(data.id) != undefined) {
                handleDroppedFolder(data.id, event.x, event.y);
            }
            else if (data.type == "JournalEntry" && game.decks.getByCard(data.id) != undefined) {
                handleDroppedCard(data.id, event.clientX, event.clientY, event.altKey);
            }
            else if (data.type == "Macro" && game.decks.getByCard(game.macros.get(data.id).getFlag(mod_scope, "cardID")) != undefined) {
                handleDroppedCard(game.macros.get(data.id).getFlag(mod_scope, "cardID"), event.clientX, event.clientY, event.altKey, game.macros.get(data.id).getFlag(mod_scope, "sideUp"));
                yield ui['cardHotbar'].populator.chbUnsetMacro(data.cardSlot);
                game.macros.get(data.id).delete();
            }
        }
        catch (err) {
            console.error(err);
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
                name: game.folders.get(folderId).name,
                img: `modules/cardsupport/assets/${Math.floor(Math.random() * 10) + 1}.png`,
                x: _x,
                y: _y,
                width: 350,
                height: 400,
                flags: {
                    [mod_scope]: {
                        'deckID': folderId
                    }
                }
            });
            resolve();
        });
    });
}
function handleDroppedCard(cardID, x, y, alt, sideUp = "front") {
    return __awaiter(this, void 0, void 0, function* () {
        let imgPath = "";
        if (alt || sideUp == "back") {
            imgPath = game.journal.get(cardID).getFlag(mod_scope, "cardBack");
        }
        else {
            imgPath = game.journal.get(cardID).data['img'];
        }
        // Determine the Tile Size:
        const tex = yield loadTexture(imgPath);
        const _width = tex.width;
        const _height = tex.height;
        // Project the tile Position
        let t = canvas.tiles.worldTransform;
        const _x = (x - t.tx) / canvas.stage.scale.x;
        const _y = (y - t.ty) / canvas.stage.scale.y;
        const cardScale = cardHotbarSettings.getCHBCardScale();
        console.debug(cardScale);
        yield Tile.create({
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
        });
    });
}
