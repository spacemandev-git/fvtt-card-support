import {handleDroppedCard} from './drop.js';

Hooks.on("ready", () => {
  //@ts-ignore
  game.socket.on('module.cardsupport', async (data:any) => {
    console.log("Socket Recieved: ", data);
    if(data.playerID != game.user.id){return;}
    if(data?.type == "DEAL"){
      await ui['cardHotbar'].populator.addToPlayerHand(data.cards);
    } else if (data?.type == "UPDATESTATE") {
      game.decks.get(data.deckID)
    } else if (data?.type == "SETDECKS") {
      game.decks.decks = JSON.parse(game.settings.get("cardsupport", "decks"))
    } else if (data?.type == "DISCARD") {
      game.decks.getByCard(data.cardID).discardCard(data.cardID);
    } else if (data?.type == "GIVE") {
      if(data.to != game.user.id){
        game.decks.giveToPlayer(data.to, data.cardID);
      } else {
        await ui['cardHotbar'].populator.addToHand([data.cardID])
      }
    } else if (data?.type == "RESETDECK"){
      ui['cardHotbar'].populator.resetDeck(data.deckID);
    } else if (data?.type == "REVEALCARD"){
      game.journal.get(data.cardID).show("image", true);
    } else if (data?.type == "DROP"){
      handleDroppedCard(data.cardID, data.x, data.y, data.alt)
      //handleTokenCard(data.cardID, data.x, data.y, data.alt)
    } else if (data?.type == "TAKECARD") {
      let img = ui['cardHotbar'].macros[data.cardNum-1].icon
      let macro = ui['cardHotbar'].macros[data.cardNum-1].macro

      let tex = await loadTexture(img)
      new Dialog({
        title: `${game.users.get(data.playerID).data.name} is requesting a card`,
        content: `
          <img src="${img}"></img>        
        `,
        buttons: {
          accept: {
            label: "Accept",
            callback: async () => {
              if(game.user.isGM){
                game.decks.giveToPlayer(data.cardRequester, macro.getFlag("world", "cardID"));
              } else {
                let msg = {
                  type: "GIVE",
                  playerID: game.users.find(el => el.isGM && el.active).id, //Send to GM for processing
                  to: data.cardRequester,
                  cardID: macro.getFlag("world", "cardID")
                }
                //@ts-ignore
                game.socket.emit('module.cardsupport', msg);  
              }
              //delete the macro in hand
              await ui['cardHotbar'].populator.chbUnsetMacro(data.cardNum)
            }
          },
          decline: {
            label: "Decline"
          }
        }
      }, {
        height: tex.height,
        width: tex.width
      }).render(true)
    }
  })  
})

export interface MSG_TAKECARD {
  type: "TAKECARD",
  playerID: string,
  cardRequester: string,
  cardNum: number
}

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

export interface GIVE {
  type: "GIVE",
  playerID: string,
  to:string, 
  cardID: string
}

export interface MSG_RESETDECK {
  type: "RESETDECK",
  playerID: string,
  deckID: string
}

export interface MSG_REVEALCARD {
  type: "REVEALCARD",
  playerID:string,
  cardID: string
}

export interface MSG_DROPTILE {
  type: "DROP",
  playerID: string,
  cardID: string,
  x: number, 
  y: number,
  alt: boolean
}

