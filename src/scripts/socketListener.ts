import {handleDroppedCard} from './drop.js';
import { Deck } from './deck.js';
import {ViewJournalPile, DiscardJournalPile} from './DeckForm.js';

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
    } else if (data?.type == "DRAWCARDS") {
      game.decks.get(data.deckID).dealToPlayer(
        data.receiverID,
        data.numCards,
        data.replacement
      )
    } else if (data?.type == "REQUESTVIEWCARDS") {
      let cards:JournalEntry[] = [];
      let deck =(<Deck>game.decks.get(data.deckID))
      let cardIDs = deck._state.slice(deck._state.length - data.viewNum)
      cards = cardIDs.map(el => {
        return game.journal.get(el)
      }).reverse()
      let reply:MSG_VIEWCARDS = {
        type: "VIEWCARDS",
        playerID: data.requesterID,
        deckID: data.deckID,
        cards: cards
      }
      //@ts-ignore
      game.socket.emit('module.cardsupport', reply)
    } else if (data?.type == "VIEWCARDS") {
      new ViewJournalPile({
        deckID: data.deckID,
        cards: data.cards
      }).render(true)
    } else if (data?.type == "REMOVECARDFROMSTATE") {
      game.decks.get(data.deckID).removeFromState([data.cardID]);
    } else if (data?.type == "REMOVECARDFROMDISCARD") {
      game.decks.get(data.deckID).removeFromDiscard([data.cardID]);
    } else if (data?.type == "REQUESTDISCARD") {
      let cards: JournalEntry[] = []
      cards = (<Deck>game.decks.get(data.deckID))._discard.map(el => {
        return game.journal.get(el)
      })
      let reply:MSG_VIEWDISCARD = {
        type: "VIEWDISCARD",
        playerID: data.requesterID,
        deckID: data.deckID,
        cards: cards
      }
      //@ts-ignore
      game.socket.emit('module.cardsupport', reply);
    } else if (data?.type == "VIEWDISCARD") {
      new DiscardJournalPile({
        deckID: data.deckID,
        cards: data.cards
      }).render(true)
    } else if (data?.type == "CARDTOPDECK") {
      (<Deck>game.decks.get(data.deckID)).addToDeckState([data.cardID]);
      (<Deck>game.decks.get(data.deckID)).removeFromDiscard([data.cardID]);
    } else if (data?.type == "SHUFFLEBACKDISCARD") {
      (<Deck>game.decks.get(data.deckID)).addToDeckState(game.decks.get(data.deckID)._discard);
      (<Deck>game.decks.get(data.deckID)).removeFromDiscard(game.decks.get(data.deckID)._discard);
      (<Deck>game.decks.get(data.deckID)).shuffle();
    } else if (data?.type == "GETALLCARDSBYDECK"){
      let cards:JournalEntry[] = [];
      let deck =(<Deck>game.decks.get(data.deckID))
      let cardIDs = deck._state.slice(deck._state.length - data.viewNum)
      cards = cardIDs.map(el => {
        return game.journal.get(el)
      }).reverse()
      
      let msg:MSG_RECEIVECARDSBYDECK = {
        type: "RECEIVECARDSBYDECK",
        playerID: data.to,
        cards: cards,
        deckID: data.deckID
      }
      
      game.socket.emit('module.cardsupport', msg)
    }
  })  
})

export interface MSG_RECEIVECARDSBYDECK {
  type: "RECEIVECARDSBYDECK",
  playerID: string,
  cards: JournalEntry[],
  deckID: string
}

export interface MSG_GETALLCARDSBYDECK {
  type: "GETALLCARDSBYDECK",
  playerID: string,
  to: string,
  deckID: string
}

export interface MSG_SHUFFLEBACKDISCARD {
  type: "SHUFFLEBACKDISCARD",
  playerID: string,
  deckID: string
}

export interface MSG_CARDTOPDECK {
  type: "CARDTOPDECK",
  playerID: string,
  deckID: string,
  cardID: string
}

export interface MSG_REMOVEFROMDISCARD {
  type: "REMOVEFROMDISCARD",
  playerID: string,
  deckID: string,
  cardID: string
}

export interface MSG_VIEWDISCARD {
  type: "VIEWDISCARD", 
  playerID:string, 
  deckID: string,
  cards: JournalEntry[]
}

export interface MSG_REQUESTDISCARD {
  type: "REQUESTDISCARD",
  playerID: string,
  requesterID: string,
  deckID: string
}
export interface MSG_REMOVECARDFROMDISCARD {
  type: "REMOVECARDFROMDISCARD",
  playerID: string,
  deckID: string,
  cardID: string
}

export interface MSG_REMOVECARDFROMSTATE {
  type: "REMOVECARDFROMSTATE"
  playerID: string,
  deckID: string,
  cardID: string
}

export interface MSG_VIEWCARDS {
  type: "VIEWCARDS",
  playerID: string,
  deckID: string
  cards: JournalEntry[],
}

export interface MSG_REQUESTVIEWCARDS {
  type: "REQUESTVIEWCARDS",
  playerID: string,
  requesterID: string,
  deckID: string,
  viewNum: string
}

export interface MSG_DRAWCARDS {
  type: "DRAWCARDS",
  playerID: string,
  receiverID: string,
  deckID: string,
  numCards: number,
  replacement: boolean
}

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

