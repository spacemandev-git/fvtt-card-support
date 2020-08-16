export class cardHotbarPopulator {
    constructor() { 
        this.macroMap = this.chbGetMacros();
    }

    async addToHand(cardId, sideUp) {
        //console.debug("Card Hotbar | Adding card to hand...");
        //generate macro for card
        //TODO: better consolidate with code in index.js in hotbarDrop hook (call hook? make function at least?)
        // Make a new macro for the Journal
        
        //will use the card facing if provided (1 = front, 0 = back). Otherwise default to User Flag for drawFaceUp, else setting for same.
        let defaultSide = true;
        if ( game.user.getFlag("cardsupport","chbDrawFaceUp") != undefined ) {
            defaultSide = game.user.getFlag("cardsupport","chbDrawFaceUp");
        } else {
            defaultSide = game.settings.get("cardsupport","chbDrawFaceUp");
        }
        
        console.debug(`Card Hotbar | defaultSide is: ${defaultSide}`);
        if (sideUp === undefined) sideUp = defaultSide;
        sideUp ? sideUp = "front" : sideUp ="back";
        console.debug(sideUp);
        if (sideUp == undefined) {
            ui.notifications.error("Error: Cannot determine card facing.");
            return;
        }
        const maxSlot = 50; 
        let journal = {};
        let firstEmpty = this.getNextSlot();
        //check for invalid input
        if (!cardId.length) {
            ui.notifications.notify.error("Please provide an array of cardIds");
            return false;
        } 
        if ( firstEmpty === -1 ) {
            ui.notifications.error("There is no room in your hand.");
            return false;
        }
        for (let i = 0; i < cardId.length; i++) { 
            if ( maxSlot >= i + firstEmpty ) {
                journal = game.journal.get(cardId[i]);
                Macro.create({
                    name: `Card: ${journal.name}`,
                    type: "script",
                    flags: {
                        "world": {
                            "cardId": journal.id,
                            "sideUp": sideUp
                        }
                    },
                    scope: "global",
                    command: `game.journal.get("${journal.id}").sheet.render(true, {sheetMode: "image"} );`,
//                  backup copy -   img: `${game.journal.get(journal.id).data.img}`
                    img: sideUp == "front" ? journal.data.img : journal.getFlag("world","cardBack") 
                }).then(macro => {
                    window.cardHotbar.chbSetMacro(macro.id, firstEmpty+i);
                });
            } else {
                ui.notifications.error("Not enough space in hand, at least 1 card not added.");
                ui.cardHotbar.render();
                return -1;
            }
        }
        return ui.cardHotbar.render();
    }
    
    async flipCard(slot) {
        //delete and recreate instead of update?? hrrm.
        let cardEntry = game.journal.get(  game.macros.get( this.macroMap[slot] ).getFlag("world", "cardId" ) );
        let mm = ui.cardHotbar.macros[slot - 1].macro;
        let newImg = "";
        let sideUp = "";
        //console.debug(cardEntry);
        //console.debug(mm);

        if(mm.data.img == cardEntry.data['img']){
            // Card is front up, switch to back
            newImg = cardEntry.getFlag("world", "cardBack");
            sideUp = "back";            
        } else if( mm.data.img == cardEntry.getFlag("world", "cardBack") ) {
            // Card is back up
            newImg = cardEntry.data['img']
            sideUp = "front";
        } else{ 
            ui.notifications.error("What you doing m8? Stop breaking Spaceman's code that Norc stole...");
            return sideUp;
        }
        //TO DO: combine with mm.update statement below
        await mm.setFlag("world","sideUp",sideUp);
        await mm.update({img: newImg});
        return sideUp;
    }

    compact() {
        let filled = duplicate( this.macroMap.filter(function (card) {
            return card != null;
          }) );
        filled.unshift(null);
        //console.debug("Card Hotbar | Compacting... ");
        //console.debug(filled);
        return filled;
    }

    //checks to see if there is available space in the hand. Returns -1 if entirely full (this is an error code)
    //or the last available slot number otherwise
    getNextSlot() {
        //console.debug ("Card Hotbar | Checking macroMap for next available slot...");
        //have to perform some trickery so that the null at slot 0 is not picked up incorrectly.
        //functionally, this will return the actual slot number when 1 is added again at end.
        let slotCheck = this.macroMap.slice(1);
        const maxSlot = 50;
        slotCheck.length = maxSlot;
        const startSlot = this.macroMap.filter(slot => slot).length;
        //console.debug("Card Hotbar | Filling slotCheck...");
        //console.debug(startSlot, maxSlot);
        slotCheck.fill(null,startSlot,maxSlot);
        //console.debug("Card Hotbar | slotCheck");
        //console.debug(slotCheck);
        let result = slotCheck.findIndex(this.checkSlotNull) 
        return result != -1 ? result + 1 : -1 ;  
    } 

    checkSlotNull(cardId) {
        return cardId == null;     
    }

    /**
     * Returns a single cardHotbar macro
     * @return {string[]} [slot]: macroId
     */
    chbGetMacro(slot) {
        return game.user.getFlag('cardsupport', 'chbMacroMap')[slot] || [];
    }

    /**
     * Returns all cardHotbar macros
     * @return {string[]} [slot]: macroId
     */
    chbGetMacros() {
        return game.user.getFlag('cardsupport', 'chbMacroMap') || [];
    }

    /**
     * Set or replace a macro on one of the card hotbar slots.
     * @param {string} macroId
     * @param {number} slot 
     * @return {Promise<unknown>} Promise indicating whether the macro was set and the hotbar was rendered.
     */
    chbSetMacro(macroId, slot) {
        //console.debug("Card Hotbar |", "Setting macro", slot, macroId);
        this.macroMap[slot] = macroId;
        ui.cardHotbar.getcardHotbarMacros();
        this._updateFlags().then(render => { 
            return ui.cardHotbar.render();
        });
    }

    /**
     * Replace all card hotbar slots.
     * @param {string[]} macros ([slot]: macroId)
     * @return {Promise<unknown>} Promise indicating whether the macros were set and the hotbar was rendered.
     */
    async chbSetMacros(macros) {
        /**
         * !
         * ! Assumes a single page card hotbar with slots 1-10
         * !
         */
        for (let slot = 1; slot < 11; slot++) {
            this.macroMap[slot] = ui.cardHotbar.macros[slot];
        }
        await this._updateFlags();
        return ui.cardHotbar.render();
    }

    /**
     * Remove the macro from the card hotbar slot.
     * @param {number} slot
     * @return {Promise<unknown>} Promise indicating whether the macro was removed.
     */
    async chbUnsetMacro(slot) {
        this.macroMap[slot] = null;
        this.macroMap = duplicate( await this.compact() );
        ui.cardHotbar.getcardHotbarMacros();
        this._updateFlags().then(render => { 
            return ui.cardHotbar.render();
        });
    }

    /**
     * Remove all macros from the card hotbar.
     * @return {Promise<unknown>} Promise indicating whether the macros were removed.
     */
    chbResetMacros() {
        this.macroMap = [];
        return this._updateFlags();
    }

    async _updateFlags() {
        await game.user.unsetFlag('cardsupport', 'chbMacroMap');
        return game.user.setFlag('cardsupport', 'chbMacroMap', this.macroMap);
    }
}
