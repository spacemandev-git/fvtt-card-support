import {SocketMessage} from './constants.js';

Hooks.on("ready", () => {
  //@ts-ignore
  game.socket.on('module.cardsupport', data => {
    let msg:SocketMessage = data;
    if(msg.type == "DEAL"){
      ui.notifications.info(`${game.users.get(msg.from).name} delt you ${msg.cardIDs.length} from ${msg.deck} deck.`)
      ui['cardHotbar'].populator.addToHand(msg.cardIDs)
    }
  })  
})
