//import { Deck } from "../scripts/deck.js";

export class cardHotbar extends Hotbar {
    /**
     * @param {cardHotbarPopulator} populator
     * @param {*} options 
     */
  constructor(populator, options) {
  //  super(Hotbar);
    super(options);
    game.macros.apps.push(this);
    /**
     * The currently viewed macro page
     * @type {number}
     */
    this.page = 1;
    /**
     * The currently displayed set of macros
     * @type {Array}
     */
    this.macros = [];
    /**
     * Track collapsed state
     * @type {boolean}
     */
    this._collapsed = false;
    /**
     * Track which hotbar slot is the current hover target, if any
     * @type {number|null}
     */
    this._hover = null;

    /**
     * 
     */
    this.cardMacros = [];

    /**
     * 
     */
    this.populator = populator;
  }
  
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "card-hotbar",
      template: "modules/cardsupport/cardhotbar/templates/cardHotbar.html",
      popOut: false,
      dragDrop: [{ dragSelector: ".macro", dropSelector: "#card-macro-list" }]
    });
  }    

	/* -------------------------------------------- */

  /** @override */
  getData(options) {
      this.macros = this._getcardMacrosByPage(this.page);
    return {
      page: this.page,
      macros: this.macros,
      barClass: this._collapsed ? "collapsed" : ""
    };
  }

  /* -------------------------------------------- */

/**
 * Get the Array of Macro (or null) values that should be displayed on a numbered page of the card hotbar
 * @param {number} page
 * @returns {Array}
 * @private
 */
  _getcardMacrosByPage(page) { 
    let nextCard = false;
    const macros = this.getcardHotbarMacros(page);
    for ( let [i, m] of macros.entries() ) {
      m.key = i<9 ? i+1 : 0;
      m.cssClass = m.macro ? "active" : "inactive";
      //additional logic to mark the first empty slot as "next"
      if (m.cssClass == "inactive" && nextCard == false ) {
        m.cssClass = "next";
        nextCard = true;
      }
      m.icon = m.macro ? m.macro.data.img : null;
    }
    return macros;
  }

  _getMacrosByPage(page) {
	  return this._getcardMacrosByPage(page);
	}

	/* -------------------------------------------- */

  /**
   * Get an Array of Macro Entities on this User's Hotbar by page
   * @param {number} page     The hotbar page number
   * @return {Array.<Object>}
   */
  getcardHotbarMacros(page=1) {
    const macros = Array.fromRange(50).map(m => null);
    for ( let [k, v] of Object.entries(this.populator.chbGetMacros())) {
      macros[parseInt(k)-1] = v
    }
    const start = (page-1) * 10;
    return macros.slice(start, start+10).map((m, i) => {
      return {
        slot: start + i + 1,
        macro: m ? game.macros.get(m) : null
      };
    });
  }

  


	/* -------------------------------------------- */

  /**
   * Assign a Macro to a numbered card hotbar slot between 1 and 10
   * eventually expand this to a full 50 later maybe
   * @param {Macro|null} macro  The Macro entity to assign
   * @param {number} slot       The integer Hotbar slot to fill
   * @param {number} [fromSlot] An optional origin slot from which the Macro is being shifted
   * @return {Promise}          A Promise which resolves once the User update is complete
   */
  async assigncardHotbarMacro(macro, slot, {fromSlot=null}={}) {
    console.debug("card Hotbar | assigncardHotbarMarcro", macro, slot, fromSlot);
    if ( !(macro instanceof Macro) && (macro !== null) ) throw new Error("Invalid Macro provided");
//    const chbMacros = this.populator.chbGetMacros();

    // If a slot was not provided, get the first available slot
    slot = slot ? parseInt(slot) : Array.fromRange(10).find(i => !(i in ui.cardHotbar));
    if ( !slot ) throw new Error("No available Hotbar slot exists");
    if ( slot < 1 || slot > 10 ) throw new Error("Invalid Hotbar slot requested");

    // Update the hotbar data
    const update = duplicate(ui.cardHotbar);
    console.debug("card Hotbar |", slot);
    if ( macro ) await this.populator.chbSetMacro(macro.id,slot);
    else {
      console.debug('card Hotbar | Unsetting!');
      await this.populator.chbUnsetMacro(slot);
    }

    //functional but needs cleanup
    console.debug("card Hotbar | Finding move origin");
    if ( fromSlot ) {
      console.debug("card Hotbar |", ui.cardHotbar.macros);
      console.debug("card Hotbar |", ui.cardHotbar.macros[fromSlot-1]?.macro, ui.cardHotbar.macros[fromSlot-1]?.macro === macro);
     
      if (ui.cardHotbar.macros[fromSlot-1]?.macro === macro) {
        console.debug("card Hotbar | internal move detected!");
        if ( fromSlot != slot ) {
          console.debug(`card Hotbar | trying to delete slot ${fromSlot} in cardHotbar`);
          await this.populator.chbUnsetMacro(fromSlot);
        }
      } else {
        console.debug("card Hotbar | drop from core macro hotbar detected!");
      }
    } else {
      console.debug("card Hotbar | non-hotbar drop detected!");
    }
 
    ui.cardHotbar.render();
    //code suggested by tposney. creates hook to allow reassignment of monky hotpatch
    Hooks.callAll("cardHotbarAssignComplete");
    return update;
  };

        /* -------------------------------------------- */
  /**
   * Collapse the ui.cardHotbar, minimizing its display.
   * @return {Promise}    A promise which resolves once the collapse animation completes
   */
  async collapse() {
    if ( this._collapsed ) return true;
    const controls = this.element.find("#card-hotbar-directory-controls");
    const bar = this.element.find("#card-action-bar");
    const icon = controls.find("#card-bar-toggle")[0].children[1];
    return new Promise(resolve => {
      bar.slideUp(200, () => {
        icon.classList.remove("fa-caret-down")
        icon.classList.add(("fa-caret-up"));
        controls.addClass("collapsed");
        bar.addClass("collapsed");
        ui.cardHotbar.element.addClass("collapsed");
        this._collapsed = true;
        resolve(true);
      });
    });
  }
  
 	/* -------------------------------------------- */
  /**
   * Expand the cardHotbar, displaying it normally.
   * @return {Promise}    A promise which resolves once the expand animation completes
   */
  expand() {
    if ( !this._collapsed ) return true;
    const controls = this.element.find("#card-hotbar-directory-controls");
    const bar = this.element.find("#card-action-bar");
    const icon = controls.find("#card-bar-toggle")[0].children[1];
    return new Promise(resolve => {
      ui.cardHotbar.element.removeClass("collapsed");
      controls.removeClass("collapsed");
      setTimeout(250);
      bar.slideDown(200, () => {
        bar.css("display", "");
        icon.classList.remove("fa-caret-up")
        icon.classList.add(("fa-caret-down"));
        bar.removeClass("collapsed");
        this._collapsed = false;
        resolve(true);
      });
    });
  } 

  /* -------------------------------------------- */

  /**
   * Create a Context Menu attached to each Macro button
   * @param html
   * @private
   */
  _contextMenu(html) {
    new ContextMenu(html, ".macro", [
      //TODO: Add JQuery to visually deprecte delete and edit card. Add code where needed. Create More menu with submenus?
      //change draw one to click blank and/or add button.
      {
        name: "Flip Card",
        icon: '<i class="fas fa-undo"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return macro ? macro.owner : false;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          console.debug("Card Hotbar | Flipping card...");
          //add code for default card playing action here
        }
      },
      {
        name: "Reveal Card",
        icon: '<i class="fas fa-sun"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return macro ? macro.owner : false;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          console.debug("Card Hotbar | Revealing card...");
          //add code to show card's journal card here. Possibly submenu to select players.
        }
      },
      {
        name: "Edit Card Macro",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return macro ? macro.owner : false;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          macro.sheet.render(true);
        }
      },
      {
        name: "Discard",
        icon: '<i class="fas fa-trash"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return macro ? macro.owner : false;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          console.debug(macro);
          try{
            const mCardId = macro.getFlag("world","cardID");
            console.debug(mCardId);
            const mJournal = game.journal.get(mCardId);
            console.debug(mJournal);
            const mDeck = game.decks.get(mJournal.data.folder);
            console.debug(mDeck);
            console.debug("Card Hotbar | Discarding card...");
            //this needs to be added as a function. getCardDeck needs to be added to decks API also.
            mDeck.discardCard(mCardId);
            macro.delete();
          } catch (e) {
            macro.delete();
          }
        }
      },
      {
        name: "Draw Card",
        icon: '<i class="fas fa-plus"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return !macro;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          console.debug("Card Hotbar | Drawing 1 card...");
          //code to draw card here - game.decks.get(deckid).drawCard()
        }
      },
      {
        name: "Draw Multiple",
        icon: '<i class="fas fa-plus-square"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return !macro;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          console.debug("Card Hotbar | Drawing multiple cards...");
          //code to draw multiple card here - game.decks.get(deckid).drawCard() with loop and incrementing Next.
        }
      },
    ]);
  }

      /* -------------------------------------------- */
  /**
   * Change the current deck to a deck that the user picks using a dialog
   * @return {Promise}    A promise which resolves based on the user's selection
   */
  swapDeck() {
    console.debug("Card Hotbar | Swapping current deck...");
    return new Promise(resolve => {
      let newDeck = "zyWWggP2LgFPj3Nv";
      //let curDeck = "HawjSPEVGF5c43KA";
      game.user.setFlag("world","sdf-deck-cur", newDeck);
      // create dropdown with contents of Object.keys(game.decks.decks) (why not just game.decks?)
      //Now I get "cannot read propert getFlag of Null"
      resolve(true);
    });
  }

      /* -------------------------------------------- */
  /**
   * Reset a deck to its default state
   * @return {Promise}    A promise which resolves once the deck is reset
   */

  resetDeck() {
    let curDeck 
    return new Promise(resolve => {
      console.debug("Card Hotbar | Resetting current deck...");
      let curDeck = game.decks.get(game.user.getFlag("world","sdf-deck-cur"));
      //add confirmation dialog logic here
      //run swapDeck first if no current deck defined.
      curDeck.resetDeck();
    resolve(true);
    });  
  }

  
      /* -------------------------------------------- */
  /**
   * Get the first available card slot and save it as a flag
   * Saves the number of the first available slot to a flag and returns it
   * Number is -1 if no slot is available.
   * @return {number}   the slot number of the next avaialble card
   */

   //write some sort of hookscall all... setting the nextslot flag is taking too long?
   //or is it that setFlag fails every OTHER time? the hell?
    async getNextSlot() {
    let firstInactiveSlotNum = -1;
    //ui.cardHotbar.macros = ui.cardHotbar.getcardHotbarMacros(1);
    let macs = duplicate(ui.cardHotbar.macros);
    console.debug("Card Hotbar | macs is");
    console.debug(macs);
    console.debug("Card Hotbar | Setting next slot value..."); 
    await game.user.unsetFlag("world","sdf-card-next-slot");
    for(let i = 0; i < macs.length; i++) { 
      console.debug(i);
      console.debug(macs[i].cssClass);
      if(macs[i].cssClass == "next" ) {
        console.debug(`Card Hotbar | i is ${i}, slot ${macs[i].slot}, cssClass ${macs[i].cssClass}. Case: Standard. Returning slot (i+1)`);
        await game.user.setFlag("world","sdf-card-next-slot", (i+1) );
        return (i+1);
      }

      if(macs[i].cssClass == "inactive" && firstInactiveSlotNum == -1 ) {
        firstInactiveSlotNum = i+1;
      }

      //perform extra check if last slot
      if( i == (macs.length-1) ) {
        //no next was present for some reason, but there's still a blank slot
        if(macs[i].cssClass != "next" && firstInactiveSlotNum != -1) {
          console.debug(`Card Hotbar | i is ${i}, cssClass is ${macs[i].cssClass}. Case: No "next" was found but there is an inactive. Returning slot ${firstInactiveSlotNum}.`);
          await game.user.setFlag("world","sdf-card-next-slot", firstInactiveSlotNum);
          return firstInactiveSlotNum;
        } else {
          //Player hand is full, return error value
          console.debug(`Card Hotbar | i is ${i}, cssClass is ${macs[i].cssClass}. Case: hand is full, return error}.`);
          await game.user.setFlag("world","sdf-card-next-slot", -1);
          return -1; 
        }
      }
    }
  }

  	/* -------------------------------------------- */
  /*  Event Listeners and Handlers
	/* -------------------------------------------- */
  /** @override */
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('#card-bar-toggle').click(this._onToggleBar.bind(this));
    html.find('#swap-deck').click(this.swapDeck.bind(this));
    html.find('#reset-deck').click(this.resetDeck.bind(this));
    //    Disable pages for now, will just work with first page.
    //    html.find(".page-control").click(this._onClickPageControl.bind(this));
  }

  /** @override */
  async _onDrop(event) {
    event.preventDefault();
    console.debug(event);
    console.debug("card Hotbar | card-hotbar drop detected!");
    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    }
    catch (err) { return }
    console.debug(data);

    // Get the drop target
    const li = event.target.closest(".macro");

    // Allow for a Hook function to handle the event
    let cardSlot = li.dataset.slot;

    //SPACEMANDEV:  The entire purpose of the "mokey hotpatch" here is to convert non-macro drops into macros so that the hotbar can handle them.
    //              This will not be necessary for us. We will just catch journal etry drops (the last snippet down below) and use
    //              assignCardHotbarJE to handle journal entries. If we did do some sort of type converting, say if we had cards on the Canvas as Tiles,
    //              and wanted to auto-convert to JEs, a cardHotbarDrop similar to the one here would have to be done, but still no hotpatch. 


    //If needed, temporarily hijack assignHotbarMacro to trick core/modules to auto-create macros for cardHotbar instead
    //only needs to be done when dropping an item onto the card Hotbar.
    //revert once assign card macro complete
    console.debug("card Hotbar | Dropped type:", data.type);
    if (data.type == "Tile" || data.type =="JournalEntry") {
      console.debug("card Hotbar | Attempting monkey hotpatch!");
      let coreAssignHotbarMacro = game.user.assignHotbarMacro;
      game.user.assignHotbarMacro = this.assigncardHotbarMacro.bind(this); 
      Hooks.once("cardHotbarAssignComplete", () => game.user.assignHotbarMacro = coreAssignHotbarMacro);
    }
  
    //does this need to be set to false when done?
    if ( await Hooks.call("hotbarDrop", this, data, cardSlot) === undefined ) {
      console.debug("card Hotbar | hotbarDrop not found, reverting monkey hotpatch!")
      game.user.assignHotbarMacro = coreAssignHotbarMacro; 
      return; 
    } else {
      console.debug("card Hotbar | hotbarDrop true");
    }
    
    //This should never be called because the journal entry should now be a macro due to hotbarDrop 
    if (data.type =="JournalEntry") {
    // Only handles journal entry drops
    console.debug("Card Hotbar | Journal Entry Drop detected!")
    //we would have to write an equivalent _getDropJE maybe?
    const je = await this._getDropMacro(data);
    console.debug ("Card Hotbar | je is:");
    console.debug (je);
      if ( je ) {
        console.debug("card Hotbar | Journal Entry provided:", macro, "cardSlot", data.cardSlot);
        await this.assigncardHotbarJE(je, cardSlot, {fromSlot: data.cardSlot});
      }
    return;
    }

    // Only handles Macro drops
    const macro = await this._getDropMacro(data);
    if ( macro ) {
      console.debug("card Hotbar | macro provided:", macro, "fromSlot", data.cardSlot);
      console.debug("card Hotbar | monkey hotpatch?", game.user.assignHotbarMacro === this.assigncardHotbarMacro);
        await this.assigncardHotbarMacro(macro, cardSlot, {fromSlot: data.cardSlot});
    }


  }

  /* -------------------------------------------- */

  /**
   * Handle left-click events too
   * @param event
   * @private
   */
  async _onClickMacro(event) {
    console.debug("card macro click detected!");

    event.preventDefault();
    const li = event.currentTarget;

    // Case 1 - draw a card
    if ( li.classList.contains("next") ) {
      console.debug("Card Hotbar | Drawing 1 card from current deck...");
      /* REPLACE WITH CARD DRAW
      const macro = await Macro.create({name: "New Macro", type: "chat", scope: "global"});
      await ui.cardHotbar.assigncardHotbarMacro(macro, li.dataset.slot);
      macro.sheet.render(true);
      */
    }

    // Case 2 - trigger a Macro
    else {
      const macro = game.macros.get(li.dataset.macroId);
      return macro.execute();
    }
  }

  /* -------------------------------------------- */

  /** @override */
  _onDragStart(event) {
    //hide tooltip so it doesn't get in the way
    console.debug("card Hotbar | Attempting to hide tooltip.");

    const li = event.currentTarget.closest(".macro");
    if ( !li.dataset.macroId ) return false;
    document.getElementsByClassName("tooltip")[0].style.display = "none";
    const dragData = { type: "Macro", id: li.dataset.macroId, cardSlot: li.dataset.slot };
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }





  /**
   * Get the Macro entity being dropped in the cardHotbar. If the data comes from a non-World source, create the Macro
   * @param {Object} data             The data transfer attached to the DragEvent
   * @return {Promise<Macro|null>}    A Promise which returns the dropped Macro, or null
   * @private
   */
  async _getDropMacro(data) {
    console.debug("card Hotbar | in _getDropMacro", data);
    if ( data.type !== "Macro" ) return null;

    // Case 1 - Data explicitly provided (but no ID)
    if ( data.data && !data.id ) {
      return await Macro.create(data.data);
    }

    // Case 2 - Imported from a Compendium pack
    else if ( data.pack ) {
      const createData = await game.packs.get(data.pack).getEntry(data.id);
      return Macro.create(createData);
    }

    // Case 3 - Imported from a World ID
    else {
      return game.macros.get(data.id);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle hover events on a macro button to track which slot is the hover target
   * @param {Event} event   The originating mouseover or mouseleave event
   * @private
   */
    /** @override */
  _onHoverMacro(event) {
    event.preventDefault();
    const li = event.currentTarget;
    const hasAction = ( !li.classList.contains("inactive") && !li.classList.contains("next") );

    // Remove any existing tooltip
    const tooltip = li.querySelector(".tooltip");
    if ( tooltip ) li.removeChild(tooltip);

    // Handle hover-in
    if ( event.type === "mouseenter" ) {
//      console.debug("card Hotbar | Macro tooltip override fired!");
      this._hover = li.dataset.slot;
      if ( hasAction ) {
        const macro = game.macros.get(li.dataset.macroId);
        const tooltip = document.createElement("SPAN");
        tooltip.classList.add("tooltip");
        tooltip.textContent = macro.name;
        li.appendChild(tooltip);
      } 
    
      else {
        const tooltip = document.createElement("SPAN");
        tooltip.classList.add("tooltip");
        tooltip.textContent = "Click or right-click to draw";
        li.appendChild(tooltip);
      }
    
    }

    // Handle hover-out
    else {
      this._hover = null;
    }
  }
}