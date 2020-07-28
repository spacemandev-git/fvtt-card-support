/// <reference types="js-yaml" />

export const importDeck = async (deckfile: File) => {
  try{
    if(deckfile.name.split(".")[1] != "zip"){
      throw new Error("Not a Zip File")
    }
    //@ts-ignore
    const deckZip = await JSZip.loadAsync(deckfile)
    if(!deckZip.file("deck.yaml")){
      throw new Error("Deck.Yaml Not Found!")
    }
    console.log(deckZip.files)

  } catch (e) {
    ui.notifications.error(game.i18n.localize("DECK.Error"))
    console.error(e);
  }
}