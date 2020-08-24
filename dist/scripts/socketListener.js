var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Hooks.on("ready", () => {
    //@ts-ignore
    game.socket.on('module.cardsupport', (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.playerID != game.user.id) {
            return;
        }
        if ((data === null || data === void 0 ? void 0 : data.type) == "DEAL") {
            ui['cardHotbar'].populator.addToPlayerHand(data.cards);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "UPDATESTATE") {
            game.decks.get(data.deckID);
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "SETDECKS") {
            game.decks.decks = JSON.parse(game.settings.get("cardsupport", "decks"));
        }
        else if ((data === null || data === void 0 ? void 0 : data.type) == "DISCARD") {
            game.decks.getByCard(data.cardID).discardCard(data.cardID);
        }
    }));
});
