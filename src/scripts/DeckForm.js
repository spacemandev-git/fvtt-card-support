

import {ViewPile, DiscardPile} from './tileHud.js'

export class DeckForm extends FormApplication {
  constructor(obj, opts = {}){
    super(obj, opts)
  }

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: 'deckinteractionform',
      title: "Decks",
      template: "modules/cardsupport/templates/deckform.html",
      classes: ['sheet']
    })
  }

  getData() {
    let data = {
      decks: game.decks.decks
    }
    return data;
  }

  async activateListeners(html){
    for(let d of Object.values(game.decks.decks)){
      let deck = d;
      //Draw Card Listener
      html.find(`#${deck.deckID}-draw`).click(() => {
        if(!game.user.isGM && !game.settings.get('cardsupport', `${deck.deckID}-settings`)['drawCards'].includes(game.user.id)){
          ui.notifications.error("You don't have permission to do that.")
          return;
        }

        let takeDialogTemplate = `
        <div style="display:flex; flex-direction:column">
          <div style="display:flex; flex-direction:row">
            <h2 style="flex:4"> How many cards? </h2>
            <input type="number" id="numCards" value=1 style="width:50px"/>
          </div>
          <div style="display:flex; flex-direction:row">
            <h2 style="flex:4"> Draw with Replacement? </h2>
            <input type="checkbox" id="infiniteDraw"  style="flex:1"/>
          </div>
          <input style="display:none" id="deckID" value=${deck.deckID} />
        </div>     
        `
        new Dialog({
          title: "Draw Cards",
          content: takeDialogTemplate,
          buttons: {
            draw: {
              label: "Draw",
              callback: (html) => {
                if(game.user.isGM){
                  game.decks.get(html.find("#deckID")[0].value).dealToPlayer(
                    game.user.id,
                    html.find("#numCards")[0].value,
                    html.find("#infiniteDraw")[0].checked
                  )
                } else {
                  let msg = {
                    type: "DRAWCARDS",
                    playerID: game.users.find(el => el.isGM && el.active).id,
                    receiverID: game.user.id,
                    deckID: html.find("#deckID")[0].value,
                    numCards: html.find("#numCards")[0].value,
                    replacement: html.find("#infiniteDraw")[0].checked
                  }
                  //@ts-ignore
                  game.socket.emit('module.cardsupport', msg);
                }
              }
            }
          }
        }).render(true)
      })

      //View Cards Listener
      html.find(`#${deck.deckID}-view`).click(() => {
        if(!game.user.isGM && !game.settings.get('cardsupport', `${deck.deckID}-settings`)['viewDeck'].includes(game.user.id)){
          ui.notifications.error("You don't have permission to do that.")
          return;
        }
        let template = `
        <div>
          <p> 
          <h3> How many cards do you want to view? </h3> 
          <h3> Deck has ${game.decks.get(deck.deckID)._state.length} cards </h3> 
          <input id="numCards" value=1 type="number" style='width:50px;'/>
          </p>
        </div>
        `
        new Dialog({
          title: "View Pile",
          content: template,
          buttons: {
            view: {
              label: "View",
              callback: (html) => {
                if(game.user.isGM){
                  new ViewPile({
                    deckID: deck.deckID,
                    viewNum: html.find("#numCards")[0].value
                  }).render(true)
                } else { 
                  // send a socket request to request journal entries
                  let msg = {
                    type: "REQUESTVIEWCARDS",
                    playerID: game.users.find(el => el.isGM && el.active).id,
                    requesterID: game.user.id,
                    deckID: deck.deckID,
                    viewNum: html.find("#numCards")[0].value
                  }
                  //@ts-ignore
                  game.socket.emit('module.cardsupport', msg);
                }
              }
            }
          }
        }).render(true)
      })

      //Discard Listener
      html.find(`#${deck.deckID}-discard`).click(() => {
        if(!game.user.isGM && !game.settings.get('cardsupport', `${deck.deckID}-settings`)['viewDiscard'].includes(game.user.id)){
          ui.notifications.error("You don't have permission to do that.")
          return;
        }
        if(game.user.isGM){
          let discardPile = []
          for(let card of deck._discard){
            discardPile.push(game.journal.get(card));
          }
          new DiscardPile({pile: discardPile, deck: deck}, {}).render(true)
        } else {
          let msg = {
            type: "REQUESTDISCARD",
            playerID: game.users.find(el=>el.isGM && el.active).id,
            deckID: deck.deckID,
            requesterID: game.user.id
          }
          //@ts-ignore
          game.socket.emit('module.cardsupport', msg)
        }
      })
    }
  }
}

export class ViewJournalPile extends FormApplication {
  __init() {this.deckID = ""}
  __init2() {this.cards = []}

  constructor(obj, opts = {}){
    super(obj, opts);ViewJournalPile.prototype.__init.call(this);ViewJournalPile.prototype.__init2.call(this);
    this.deckID = obj['deckID']
    this.cards = obj['cards']

    if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
      ChatMessage.create({
        speaker: {
          alias: game.user.name
        },
        content: `
        <p>${game.user.name} is looking at ${this.cards.length} cards from ${game.decks.get(this.deckID).deckName}!</p>
        `
      })
    }
  }

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: "viewpile",
      title: "View Deck",
      template: "modules/cardsupport/templates/cardgrid.html",
      classes: ['sheet'],
    })
  }
  getData() {
    //Journal Entries passed in get stripped down so they don't have data, which breaks cardgrid, so we're adding the nesting back in
    let cards = this.cards.map(el => {
      return {
        data: el,
        _id: el['_id']
      }
    })
    let data = {
      cards:cards,
      discard: false
    }
    console.log(data);
    return data;
  }

  async activateListeners(html){
    let cardIDs = this.cards.map(el =>{ return el['_id'] })
    // Take
    for(let cardID of cardIDs){
      html.find(`#${cardID}-take`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToPlayerHand([this.cards.find(el => el['_id'] == cardID)]);
        
        // GM SOCKET TO REMOVEFROMSTATE a Card
        let msg = {
          type: "REMOVECARDFROMSTATE",
          playerID: game.users.find(el=> el.isGM && el.active).id,
          deckID: this.deckID,
          cardID: cardID
        }
        //@ts-ignore
        game.socket.emit('module.cardsupport', msg);
        this.cards = this.cards.filter(el=> {
          return el._id != cardID
        })

        if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
          ChatMessage.create({
            speaker: {
              alias: game.user.name
            },
            content: `
            <p>${game.user.name} took a card from ${game.decks.get(this.deckID).deckName}!</p>
            `
          })
        }

        this.render(true);      
      })

      html.find(`#${cardID}-takecopy`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToPlayerHand([this.cards.find(el => el['_id'] == cardID)]);
        this.cards = this.cards.filter(el=> {
          return el._id != cardID
        })
        
        if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
          ChatMessage.create({
            speaker: {
              alias: game.user.name
            },
            content: `
            <p>${game.user.name} took a card as copy from ${game.decks.get(this.deckID).deckName}!</p>
            `
          })
        }
      
      
        this.render(true);      
      })
    }
  }
}

export class DiscardJournalPile extends FormApplication {
  __init3() {this.deckID = ""}
  __init4() {this.cards = []}

  constructor(obj, opts={}){
    super(obj, opts);DiscardJournalPile.prototype.__init3.call(this);DiscardJournalPile.prototype.__init4.call(this);
    this.deckID = obj['deckID']
    this.cards = obj['cards']
    if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
      ChatMessage.create({
        speaker: {
          alias: game.user.name
        },
        content: `
        <p>${game.user.name} is viewing ${this.cards.length} from the discard of ${game.decks.get(this.deckID).deckName}!</p>
        `
      })
    }
  
  }

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: 'discardpile',
      title: "Discard Pile",
      template: "modules/cardsupport/templates/cardgrid.html",
      classes: ['sheet'],
    })
  }

  getData() {
    //Journal Entries passed in get stripped down so they don't have data, which breaks cardgrid, so we're adding the nesting back in
    let cards = this.cards.map(el => {
      return {
        data: el,
        _id: el['_id']
      }
    })
    let data = {
      cards:cards,
      discard: true
    }
    console.log(data);
    return data;
  }

  async activateListeners(html){
    let cardIDs = this.cards.map(el =>{ return el['_id'] })
    // Take
    for(let cardID of cardIDs){
      html.find(`#${cardID}-take`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToPlayerHand([this.cards.find(el => el['_id'] == cardID)]);
        
        // GM SOCKET TO REMOVEFROMSTATE a Card
        let msg = {
          type: "REMOVECARDFROMDISCARD",
          playerID: game.users.find(el=> el.isGM && el.active).id,
          deckID: this.deckID,
          cardID: cardID
        }
        //@ts-ignore
        game.socket.emit('module.cardsupport', msg);
        this.cards = this.cards.filter(el=> {
          return el._id != cardID
        })

        if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
          ChatMessage.create({
            speaker: {
              alias: game.user.name
            },
            content: `
            <p>${game.user.name} took a card ${game.decks.get(this.deckID).deckName} discard pile!</p>
            `
          })
        }
      

        this.render(true);
      })

      html.find(`#${cardID}-takecopy`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToPlayerHand([this.cards.find(el => el['_id'] == cardID)]);
        this.cards = this.cards.filter(el=> {
          return el._id != cardID
        })
        if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
          ChatMessage.create({
            speaker: {
              alias: game.user.name
            },
            content: `
            <p>${game.user.name} took a card as copy from ${game.decks.get(this.deckID).deckName} discard!</p>
            `
          })
        }
        this.render(true);
      })
    
      html.find(`#${cardID}-burn`).click(() => {
        let msg = {
          type: "REMOVECARDFROMDISCARD",
          playerID: game.users.find(el => el.isGM && el.active).id,
          deckID: this.deckID,
          cardID: cardID
        }
        //@ts-ignore
        game.socket.emit('module.cardsupport', msg)
        this.cards = this.cards.filter(el=> {
          return el._id != cardID
        })

        if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
          ChatMessage.create({
            speaker: {
              alias: game.user.name
            },
            content: `
            <p>${game.user.name} burnt a card from ${game.decks.get(this.deckID).deckName}!</p>
            `
          })
        }
      
        this.render(true);
      })
      
      html.find(`#${cardID}-topdeck`).click(() => {
        let msg = {
          type: "CARDTOPDECK",
          playerID: game.users.find(el => el.isGM && el.active).id,
          deckID: this.deckID,
          cardID: cardID
        }
        //@ts-ignore
        game.socket.emit('module.cardsupport', msg);

        this.cards = this.cards.filter(el=> {
          return el._id != cardID
        })

        if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
          ChatMessage.create({
            speaker: {
              alias: game.user.name
            },
            content: `
            <p>${game.user.name} returned a card to the top of the deck from ${game.decks.get(this.deckID).deckName}'s discard!</p>
            `
          })
        }
      
        this.render(true);
      })
    }
    html.find(`#shuffleBack`).click(() => {
      let msg = {
        type: "SHUFFLEBACKDISCARD",
        playerID : game.users.find(el => el.isGM && el.active).id,
        deckID: this.deckID
      }
      //@ts-ignore
      game.socket.emit('module.cardsupport', msg)
      this.cards = []
      if(game.settings.get("cardsupport", "chatMessageOnPlayerAction")){
        ChatMessage.create({
          speaker: {
            alias: game.user.name
          },
          content: `
          <p>${game.user.name} shuffled the discard of ${game.decks.get(this.deckID).deckName} back into the deck!</p>
          `
        })
      }
      this.render(true);
    })
    html.find(`#close`).click(() => {this.close()})
  }
}