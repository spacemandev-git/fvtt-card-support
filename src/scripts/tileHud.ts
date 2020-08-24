import {mod_scope} from './constants.js';
import { Deck } from './deck.js';
import {cardHotbarSettings} from '../cardhotbar/scripts/card-hotbar-settings.js'

Hooks.on('renderTileHUD', (tileHUD, html, options) => {
  //console.log(tileHUD);
  //console.log(options.flags);

  if(options.flags?.[mod_scope]?.cardID != undefined){
    cardHUD(tileHUD, html);
  } else if (options.flags?.[mod_scope]?.deckID != undefined){
    deckHUD(tileHUD.object.data, html)
  }
})

async function cardHUD(tileHUD, html) {
  const handDiv = $('<i class="control-icon fa fa-hand-paper" aria-hidden="true" title="Take"></i>')
  const flipDiv = $('<i class="control-icon fa fa-undo" aria-hidden="true" title="Flip"></i>')
  const discardDiv = $('<i class="control-icon fa fa-trash" aria-hidden="true" title="Discard"></i>')

  html.find('.left').append(handDiv);
  html.find('.left').append(flipDiv);
  html.find('.left').append(discardDiv);

  handDiv.click((ev) => {
    takeCard(tileHUD.object.data)
  })

  flipDiv.click((ev) => {
    flipCard(tileHUD.object.data)
  })

  discardDiv.click((ev) => {
    discardCard(tileHUD.object.data)
  })

  //Embdded Functions
  const flipCard = async (td:TileData) => {
    //Create New Tile at Current Tile's X & Y
    let cardEntry = game.journal.get(td.flags[mod_scope].cardID)
    let newImg = "";
    
    if(td.img == cardEntry.data['img']){
      // Card if front up, switch to back
      newImg = cardEntry.getFlag(mod_scope, "cardBack")
    } else if(td.img == cardEntry.getFlag(mod_scope, "cardBack")){
      // Card is back up
      newImg = cardEntry.data['img']
    } else{ 
      ui.notifications.error("What you doing m8? Stop breaking my code");
      return;
    }
    Tile.create({
      img: newImg,
      x: td.x,
      y: td.y,
      width: td.width,
      height: td.height, 
      flags: td.flags
    })

    //Delete this tile
    canvas.tiles.get(td._id).delete();
  }
  const takeCard = async (td:TileData) => {
    // UI.cardhotbar.populator.addToHand(cardID)
    // Delete this tile
    ui['cardHotbar'].populator.addToHand([td.flags[mod_scope]['cardID']])
    canvas.tiles.get(td._id).delete();    

  }
  const discardCard = async(td:TileData) => {
    // Add Card to Discard for the Deck
    let deckId = game.journal.get(td.flags[mod_scope].cardID).data['folder'];
    console.log("Deck ID: ", deckId);
    game.decks.get(deckId).discardCard(td.flags[mod_scope].cardID);
    // Delete Tile
    canvas.tiles.get(td._id).delete()
  }
}

interface TileData {
  flags: {
    [scope:string]: any
  }, 
  height: number,
  hidden: boolean,
  img: string,
  locaked: boolean,
  rotation: number,
  scale: number,
  width: number,
  x: number, 
  y: number,
  z: number,
  _id: string
}

async function deckHUD(td:TileData, html) {
  const deckID = td.flags[mod_scope]['deckID'];

  // Draw To Hand
    // Draw to Hand Flipped (?)
  const handDiv = $('<i class="control-icon fa fa-hand-paper" aria-hidden="true" title="Draw"></i>')
  html.find(".left").append(handDiv)
  handDiv.click((ev) => draw(td))

  // Show Discard
    // Add Discard Back to Deck
  const discardDiv = $('<i class="control-icon fa fa-trash" aria-hidden="true" title="Discard Pile"></i>')
  html.find(".left").append(discardDiv)
  discardDiv.click((ev) => showDiscard())
  // Reset Deck
  const resetDiv = $('<i class="control-icon fa fa-undo" aria-hidden="true" title="Reset Deck (Original state, unshuffled, with all cards)"></i>')
  html.find(".left").append(resetDiv)
  resetDiv.click((ev) => resetDeck())
  // Shuffle
  const shuffleDiv = $('<i class="control-icon fa fa-random" aria-hidden="true" title="Shuffle"></i>')
  html.find(".left").append(shuffleDiv)
  shuffleDiv.click((ev) => shuffleDeck())

  const viewDiv = $('<i class="control-icon fa fa-eye" aria-hidden="true" title="View Deck"></i>')
  html.find(".left").append(viewDiv);
  viewDiv.click(ev => viewDeck())

  if(game.user.isGM){
    const dealDiv = $('<i class="control-icon icon-deal" title="Deal to players"></i>')
    html.find(".left").append(dealDiv);
    dealDiv.click(ev => dealCards()); 
  }

  let deck = (<Deck>game.decks.get(deckID))
  let deckName = game.folders.get(deckID).data.name

  //Embedded Functions
  const draw = async (td:TileData) => {
    // Ask How many cards they want to draw, default 1
    // Tick Box to Draw to Table

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
      
      <div style="display:flex; flex-direction:row">
        <h2 style="flex:4"> Draw to Table? </h2>
        <input type="checkbox" id="drawTable"  style="flex:1"/>
      </div>    
    
      <input style="display:none" value="${td.x}" id="deckX">
      <input style="display:none" value="${td.y}" id="deckY">
    </div>     
    `
    new Dialog({
      title: "Take Cards",
      content: takeDialogTemplate,
      buttons: {
        take: {
          label: "Take Cards",
          callback: async (html:any) => {
            let numCards = html.find("#numCards")[0].value
            let drawTable = html.find("#drawTable")[0].checked
            if(html.find("#infiniteDraw")[0]?.checked){
              for (let i = 0; i < numCards; i++) {
                console.log("I: ", i)
                let card = deck.infinteDraw()
                if(drawTable){
                  let tex = await loadTexture(game.journal.get(card).data['img'])
                  await Tile.create({
                    img: game.journal.get(card).data['img'],
                    x: html.find("#deckX")[0].value,
                    y: html.find("#deckY")[0].value,
                    z: 100+i,
                    width: tex.width * cardHotbarSettings.getCHBCardScale(),
                    height: tex.height * cardHotbarSettings.getCHBCardScale(),
                    flags: {
                      [mod_scope]: {
                        "cardID": card
                      }
                    }
                  })
                } else {
                  await ui['cardHotbar'].populator.addToHand([card]);
                }
              }    
            } else {
                for (let i = 0; i < numCards; i++) {
                  let card = await deck.drawCard();
                  if(drawTable){
                    let tex = await loadTexture(game.journal.get(card).data['img'])
                    await Tile.create({
                      img: game.journal.get(card).data['img'],
                      x: html.find("#deckX")[0].value,
                      y: html.find("#deckY")[0].value,
                      z: 100+i,
                      width: tex.width * cardHotbarSettings.getCHBCardScale(),
                      height: tex.height * cardHotbarSettings.getCHBCardScale(),
                      flags: {
                        [mod_scope]: {
                          "cardID": card
                        }
                      }
                    })
                  } else {
                    await ui['cardHotbar'].populator.addToHand([card]);
                  }
                }
              }
            }
          }
        }
      }
    ).render(true)
  }

  const showDiscard = async () => {
    let discardPile:JournalEntry[] = []
    for(let card of deck._discard){
      discardPile.push(game.journal.get(card));
    }
    new DiscardPile({pile: discardPile, deck: deck}, {}).render(true)
  }

  const resetDeck = async ()=> {
    deck.resetDeck();
    ui.notifications.info(`${deckName} was reset to it's original state.`)
  }
  const shuffleDeck = async() => {
    deck.shuffle();
    ui.notifications.info(`${deckName} has ${deck._state.length} cards which were shuffled successfully!`)
  }

  const viewDeck = async() => {
    //ask how many cards they want to view, default value all cards
    let template = `
    <div>
      <p> 
        <h3> How many cards do you want to view? </h3> 
        <input id="cardNum" value=${deck._state.length} type="number" style='width:50px;'/> 
      </p>
    </div>
    `
    new Dialog({
      title: "View Cards",
      content: template,
      buttons: {
        ok: {
          label: "View",
          callback: async (html:any) => {
            new ViewPile({
              deckID: deck.deckID,
              viewNum: html.find("#cardNum")[0].value
            }, {}).render(true);
          }
        }
      }
    }).render(true)
  }

  const dealCards = async () => {
    let players = "";
    //@ts-ignore
    for(let user of game.users.entries){
      if(user.isSelf == false){
        players += `<option value=${user.id}>${user.name}</option>`
      }
    }
    let dealCardsDialog = `
    <h2> Deal Cards To Player </h2>
    <div style="display:flex; flex-direction:column">
      <p style="display:flex"> 
       <span style="flex:2"> Player: </span> 
       <select id="player" style="flex:1">${players}</select> 
      <p>
      <p  style="display:flex"> 
        <span style="flex:2"> Cards: </span>
        <input id="numCards" type="number" style="width:50px; flex:1" value=1 /> 
      </p>
      <p style="display:flex"> 
        <span style="flex:2"> Deal with Replacement? </span> 
        <input id="infinite" type="checkbox" style="flex:1"/> 
      </p>
    <div>
      `
    new Dialog({
      title: "Deal Cards to Player",
      content: dealCardsDialog,
      buttons: {
        deal: {
          label: "Deal",
          callback: async (html:any) => {
            let inf = html.find("#infinite")[0].checked ? true : false
            deck.dealToPlayer(
              html.find("#player")[0].value,
              html.find("#numCards")[0].value,
              inf
            )
          }
        }
      }
    }).render(true)
  }
}


class DiscardPile extends FormApplication {
  pile: JournalEntry[];
  deck: Deck; 

  constructor(object, options = {}){
    super(object, options);
    this.pile = object['pile'];
    this.deck = object['deck'];
  }
  
  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: "discardpile",
      title: "Discard Pile",
      template: "modules/cardsupport/templates/cardgrid.html",
      classes: ["sheet"],
      height: 600,
      width: 600,
    })
  }

  getData(){
    let data = {
      cards: this.pile,
      discard: true
    }
    return data;
  }

  async activateListeners(html){
    html.find('#close').click(() => {
      this.close();
    })

    html.find("#shuffleBack").click(() => {
      let cardIds = this.pile.map(el => el._id);
      console.log(cardIds);
      (<Deck>game.decks.get(this.deck.deckID)).addToDeckState(cardIds);
      (<Deck>game.decks.get(this.deck.deckID)).removeFromDiscard(cardIds);
      (<Deck>game.decks.get(this.deck.deckID)).shuffle();
      this.pile = [];
      this.render(true);
    })

    // Take
    for(let card of this.pile){
      //TAKE
      html.find(`#${card._id}-take`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToHand([card._id]);
        (<Deck>game.decks.get(this.deck.deckID)).removeFromDiscard([card._id]);
        this.pile = this.pile.filter(el=>{return el._id != card._id})
        this.render(true);
      })

      //TAKE COPY
      html.find(`#${card._id}-takecopy`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToHand([card]);
        this.close();
      })

      //BURN
      html.find(`#${card._id}-burn`).click(() => {
        (<Deck>game.decks.get(this.deck.deckID)).removeFromDiscard([card._id]);
        ui.notifications.info(`${card._id} was removed from discard!`)
        this.pile = this.pile.filter(el=>{return el._id != card._id})
        this.render(true);
      })

      //Return to Top of Deck
      html.find(`#${card._id}-topdeck`).click(() => {
        (<Deck>game.decks.get(this.deck.deckID)).addToDeckState([card._id]);
        (<Deck>game.decks.get(this.deck.deckID)).removeFromDiscard([card._id]);
        this.pile = this.pile.filter(el=>{return el._id != card._id})
        this.render(true);
      })
    }  
  }
}

class ViewPile extends FormApplication {
  deckID: string = "";
  viewNum: number = 0;

  constructor(obj, opts = {}){
    super(obj, opts)
    this.deckID = obj['deckID']
    this.viewNum = obj['viewNum']
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
    let deck =(<Deck>game.decks.get(this.deckID))
    let cardIDs = deck._state.slice(deck._state.length - this.viewNum)

    let data = {
      cards: cardIDs.map(el => {
        return game.journal.get(el)
      }).reverse(),
      discard: false
    }
    return data;
  }

  async activateListeners(html){
    let deck =(<Deck>game.decks.get(this.deckID))
    let cardIDs = deck._state.slice(deck._state.length - this.viewNum)

    // Take
    for(let card of cardIDs){
      html.find(`#${card}-take`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToHand([card]);
        (<Deck>game.decks.get(this.deckID)).removeFromState([card]);
        this.close();
      })

      html.find(`#${card}-takecopy`).click(() => {
        if(ui['cardHotbar'].populator.getNextSlot() == -1){
          ui.notifications.error("No more room in your hand")
          return;
        }
        ui['cardHotbar'].populator.addToHand([card]);
        this.close();
      })
    }
  }
}