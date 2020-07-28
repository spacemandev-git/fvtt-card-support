/// <reference types="js-yaml" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const importDeck = (deckfile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (deckfile.name.split(".")[1] != "zip") {
            throw new Error("Not a Zip File");
        }
        //@ts-ignore
        const deckZip = yield JSZip.loadAsync(deckfile);
        if (!deckZip.file("deck.yaml")) {
            throw new Error("Deck.Yaml Not Found!");
        }
        console.log(deckZip.files);
    }
    catch (e) {
        ui.notifications.error(game.i18n.localize("DECK.Error"));
        console.error(e);
    }
});
