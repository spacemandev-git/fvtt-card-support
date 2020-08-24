Hooks.on("ready", () => {
  //@ts-ignore
  game.socket.on('module.cardsupport', async (data:any) => {
    if(data.playerID != game.user.id){return;}
    if(data?.type == "DEAL"){
      ui['cardHotbar'].populator.addToPlayerHand(data.cards);
    }
  })  
})


export interface MSG_DEAL {
  type: "DEAL", 
  cards: JournalEntry[],
  playerID: string
}