Hooks.on("ready", () => {
  //@ts-ignore
  game.socket.on('module.cardsupport', async (data:any) => {
    if(data.playerID != game.user.id){return;}
    if(data?.type == "DEAL"){
      ui['cardHotbar'].populator.addToPlayerHand(data.cards);
    } else if (data?.type == "UPDATESTATE") {
      game.decks.get(data.deckID)
    } else if (data?.type == "SETDECKS") {
      game.decks.decks = JSON.parse(game.settings.get("cardsupport", "decks"))
    } else if (data?.type == "DISCARD") {
      game.decks.getByCard(data.cardID).discardCard(data.cardID);
    }
  })  
})


export interface MSG_DEAL {
  type: "DEAL", 
  playerID: string
  cards: JournalEntry[],
}

export interface MSG_UPDATESTATE {
  type: "UPDATESTATE",
  playerID: string,
  deckID: string
}

export interface MSG_SETDECKS {
  type: "SETDECKS",
  playerID: string,
}

export interface DISCARD {
  type: "DISCARD", 
  playerID: string,
  cardID: string
}