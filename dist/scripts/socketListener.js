Hooks.on("ready", () => {
    //@ts-ignore
    game.socket.on('module.cardsupport', data => {
        let msg = data;
        if (msg.type == "DEAL") {
            ui.notifications.info(`${game.users.get(msg.from).name} delt you ${msg.cardIDs.length} from ${msg.deck} deck.`);
            ui['cardHotbar'].populator.addToHand(msg.cardIDs);
        }
    });
});
