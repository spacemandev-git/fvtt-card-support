Hooks.on("decks.ready", () => {
  // Only setup settings as a gm, otherwise there might be some undefineds
  if(!game.user.isGM){return;}
  //Go through game.decks and make and register a setting for each one
  for(let deckID of Object.keys(game.decks.decks)){
    game.settings.register("cardsupport", `${deckID}-settings`, {
      config: false,
      scope: "world",
      type: Object,
      default: {
        "deckImg": "",
        "drawCards": [],
        "viewDeck": [],
        "viewDiscard": []
      }
    })
  }

  game.settings.registerMenu('cardsupport', 'decksettings', {
    name: "decksettings",
    label: "Deck Settings",
    type: DeckSettingsForm,
    restricted: true
  })
})

class DeckSettingsForm extends FormApplication{
  constructor(object, options={}){
    super(object, options)
  }

  getData(){
    return {
      decks: game.decks.decks
    }
  }

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: "decksettingsform",
      title: "Deck Settings",
      template: "modules/cardsupport/templates/decksettingsform.hbs"
    })
  }

  async activateListeners(html){

  }
}
// Default Image
// Draw Cards
// View Deck
// View Discard
