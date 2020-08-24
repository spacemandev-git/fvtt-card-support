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
    let lastCard = false;
    const macros = this.getcardHotbarMacros(page);
    for ( let [i, m] of macros.entries() ) {
      m.key = i<53 ? i+1 : 0;
      m.cssClass = m.macro ? "active" : "inactive";

    
      m.icon = m.macro ? m.macro.data.img : null;
      //additional logic to store card facing
      //TO DO: improve to replace hard-coded value with the default draw-mode?
      let defaultSide = "front";
      let curSide = m.macro ? m.macro.getFlag("world","sideUp") || defaultSide : defaultSide;
      m.sideUp = curSide ? curSide : defaultSide;
      let defaultMark = 0;
      let curMark = m.macro ? m.macro.getFlag("world","marked") || defaultMark : defaultMark;
      m.marked = curMark ? curMark : defaultMark;
      //additional logic to apply "last" and "marked"
      if (curMark) {
        console.debug("Card Hotbar | Applying mark...");
        m.cssClass = m.cssClass + " marked";
      }
      if (m.cssClass == "inactive" && lastCard == false) {
        if(macros[i-1] && macros[i-1].macro) {
          macros[i-1].cssClass == "active marked" ? macros[i-1].cssClass = "last marked" : macros[i-1].cssClass = "last";
          lastCard = true;
        }
      }
      //manually catch last card when full
      if (lastCard == false && i == 53 && m.macro) {
        m.cssClass == "active marked" ? m.cssClass = "last marked" : m.cssClass = "last";
        lastCard = true;
      }
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
    const macros = Array.fromRange(54).map(m => null);
    for ( let [k, v] of Object.entries(this.populator.chbGetMacros())) {
      macros[parseInt(k)-1] = v
    }
    const start = (page-1) * 10;
    return macros.slice(start, start+54).map((m, i) => {
      return {
        slot: start + i + 1,
        macro: m ? game.macros.get(m) : null
      };
    });
  }

  


	/* -------------------------------------------- */

  /**
   * Assign a Macro to a numbered card hotbar slot between 1 and x (currently 54)
   * eventually expand this to an unlimited architecture
   * @param {Macro|null} macro  The Macro entity to assign
   * @param {number} slot       The integer Hotbar slot to fill
   * @param {number} [fromSlot] An optional origin slot from which the Macro is being shifted
   * @return {Promise}          A Promise which resolves once the User update is complete
   */
  async assigncardHotbarMacro(macro, slot, {fromSlot=null}={}) {
    //console.debug("Card Hotbar | assigncardHotbarMarcro", macro, slot, fromSlot);
    if ( !(macro instanceof Macro) && (macro !== null) ) throw new Error("Invalid Macro provided");

    // If a slot was not provided, get the first available slot
    slot = slot ? parseInt(slot) : Array.fromRange(54).find(i => !(i in ui.cardHotbar));
    if ( !slot ) throw new Error("No available Hotbar slot exists");
    if ( slot < 1 || slot > 54 ) throw new Error("Invalid Hotbar slot requested");

    // Update the hotbar data
    const update = duplicate(ui.cardHotbar);
    //console.debug("Card Hotbar |", slot);
    if ( macro ) await this.populator.chbSetMacro(macro.id,slot);
    else {

      //console.debug('Card Hotbar | Unsetting!');
      await this.populator.chbUnsetMacro(slot);
    }

    //functional but needs cleanup
    //console.debug("Card Hotbar | Finding move origin");
    if ( fromSlot ) {
      //console.debug("Card Hotbar |", ui.cardHotbar.macros);
      //console.debug("Card Hotbar |", ui.cardHotbar.macros[fromSlot-1]?.macro, ui.cardHotbar.macros[fromSlot-1]?.macro === macro);
     
      if (ui.cardHotbar.macros[fromSlot-1]?.macro === macro) {
        //console.debug("Card Hotbar | internal move detected!");
        if ( fromSlot != slot ) {
          //console.debug(`Card Hotbar | trying to delete slot ${fromSlot} in cardHotbar`);
          await this.populator.chbUnsetMacro(fromSlot);
        }
      } else {
        //console.debug("Card Hotbar | drop from core macro hotbar detected!");
      }
    } else {
      //console.debug("Card Hotbar | non-hotbar drop detected!");
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

      //TODO: Add JQuery to visually deprecate edit card. Add dialogs

      //universal options
      {
        name: "Mark Card",
        icon: '<i class="fas fa-highlighter"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return macro ? macro.owner : false;
        },
        callback: async li => {
          const macro = game.macros.get(li.data("macro-id"));
          let curMark = macro.getFlag("world","marked",1);  
          curMark ? await macro.setFlag("world","marked",0) : await macro.setFlag("world","marked",1);
        }
      },

      //active options
      {
        name: "Reveal Card",
        icon: '<i class="fas fa-sun"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return macro ? macro.owner : false;
        },
        callback: li => {
          const journal = game.journal.get ( game.macros.get( li.data("macro-id") ).getFlag("world","cardID") );
          console.debug("Card Hotbar | Revealing card to all players...");
          //console.debug( game.macros.get( li.data("macro-id") ) );
          journal.show("image", true);
          ui.notifications.notify("Card now revealed to all players...");          
        }
      },
      {
        name: "Edit Card Macro",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          if (macro) {
            if (macro.getFlag("world", "sideUp") == "back" ) return false;
          }
          return macro ? macro.owner : false;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          macro.sheet.render(true);
        }
      },

      {
        name: "Flip Card",
        icon: '<i class="fas fa-undo"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return macro ? macro.owner : false;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          //console.debug("Card Hotbar | Flipping card...");
          let newSideUp = ui.cardHotbar.populator.flipCard( li.data("slot")  );
          //console.debug(`Card Hotbar | New facing: ${newSideUp}.` );
          ui.cardHotbar.getcardHotbarMacros();
          ui.cardHotbar.macros[li.data("slot")-1].sideUp = newSideUp;
          ui.cardHotbar.render();
          //added hook so that a module or system can perform a public announcement if needed to prevent cheating
          Hooks.callAll("heldCardFlipped");
        }
      },

      {
        name: "Discard",
        icon: '<i class="fas fa-trash"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return macro ? macro.owner : false;
        },
        callback: async li => {
          const macro = game.macros.get(li.data("macro-id"));
          const index = li.data("slot");
          try{
            const mCardId = macro.getFlag("world","cardID");
            const mDeck = game.decks.get( game.journal.get(mCardId).data.folder);
            //console.debug("Card Hotbar | Discarding card (macro, slot, deck)...");
            //console.debug(macro);
            //console.debug(index);
            //console.debug(mDeck);
            mDeck.discardCard(mCardId);
            await ui.cardHotbar.populator.chbUnsetMacro(index);
            macro.delete();
          } catch (e) {
            //console.debug ("Card Hotbar | Could not properly discard card from hand");
          }
        }
      },
      //inactive slot options
      {
        name: "Switch Deck",
        icon: '<i class="fas fa-exchange-alt"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return !macro;
        },
        callback: li => {
          const macro = game.macros.get(li.data("macro-id"));
          //console.debug("Card Hotbar | Switching decks");
          //code to switch decks here
        }
      },
      /* not used currently
      {
        name: "Draw Multiple",
        icon: '<i class="fas fa-plus-square"></i>',
        condition: li => {
          const macro = game.macros.get(li.data("macro-id"));
          return !macro;
        },
        callback: async li => {
          const macro = game.macros.get(li.data("macro-id"));
          //console.debug("Card Hotbar | Drawing multiple cards...");
          //hardcoded 3 card draw for now for demonstration purposes. TO DO: replace with dialog to choose number (default to 3?)
          let curDeck = game.decks.get( game.user.getFlag("world","sdf-deck-cur") );
          let cards = [];
          //console.debug(curDeck);
          if (curDeck) {
            //TO DO: add interface for user to choose drawn card number here.
            for (let i=1; i<=3; i++) {
               let card = await curDeck.drawCard();
               cards.push(card);
            }
            //console.debug(cards);
            ui.cardHotbar.populator.addToHand(cards);
          } else {
            ui.notifications.error("Please set a deck to draw from.");
          }
        }
      },
      */
    ]);
  }


  	/* -------------------------------------------- */
  /*  Event Listeners and Handlers
	/* -------------------------------------------- */
  /** @override */
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('#card-bar-toggle').click(this._onToggleBar.bind(this));
    html.find('#chbDiscardAll').click(this.populator.discardHand.bind(this));
    //    Disable pages for now, will just work with first page.
    //    html.find(".page-control").click(this._onClickPageControl.bind(this));
  }

  /** @override */
  async _onDrop(event) {
    event.preventDefault();
    //console.debug(event);
    //console.debug("Card Hotbar | card-hotbar drop detected!");
    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
      console.debug("Card Hotbar | data"); 
      console.debug(data);
    }
    catch (err) { return }
    //console.debug(data);

    // Get the drop target
    const li = event.target.closest(".macro");

    // Allow for a Hook function to handle the event
    let cardSlot = li.dataset.slot;

    //SPACEMANDEV:  The entire purpose of the "mokey hotpatch" here is to convert non-macro drops into macros so that the hotbar can handle them.
    //              This will not be necessary for us. We will just catch journal etry drops (the last snippet down below) and use
    //              assignCardHotbarJE to handle journal entries. If we did do some sort of type converting, say if we had cards on the Canvas as Tiles,
    //              and wanted to auto-convert to JEs, a cardHotbarDrop similar to the one here would have to be done, but still no hotpatch. 


    //If needed, temporarily hijack assignHotbarMacro to trick core/modules to auto-create macros for cardHotbar instead
    //only needs to be done when dropping an item onto the Card Hotbar.
    //revert once assign card macro complete
    //console.debug("Card Hotbar | Dropped type:", data.type);
    if (data.type == "Tile" || data.type =="JournalEntry") {
      //console.debug("card Hotbar | Attempting monkey hotpatch!");
      let coreAssignHotbarMacro = game.user.assignHotbarMacro;
      game.user.assignHotbarMacro = this.assigncardHotbarMacro.bind(this); 
      Hooks.once("cardHotbarAssignComplete", () => game.user.assignHotbarMacro = coreAssignHotbarMacro);
    }
  
    //does this need to be set to false when done?
    if ( await Hooks.call("hotbarDrop", this, data, cardSlot) === undefined ) {
      //console.debug("Card Hotbar | hotbarDrop not found, reverting monkey hotpatch!")
      game.user.assignHotbarMacro = coreAssignHotbarMacro; 
      return; 
    } else {
      //console.debug("card Hotbar | hotbarDrop true");

    }
    
    //This should never be called because the journal entry should now be a macro due to hotbarDrop 
    if (data.type =="JournalEntry") {
    // Only handles journal entry drops
    //console.debug("Card Hotbar | Journal Entry Drop detected!")
    //we would have to write an equivalent _getDropJE maybe?
    const je = await this._getDropMacro(data);
    //console.debug ("Card Hotbar | je is:");
    //console.debug (je);
      if ( je ) {

        //console.debug("Card Hotbar | Journal Entry provided:", macro, "cardSlot", data.cardSlot);

        await this.assigncardHotbarJE(je, cardSlot, {fromSlot: data.cardSlot});
      }
    return;
    }

    // Only handles Macro drops
    const macro = await this._getDropMacro(data);
    if ( macro ) {
      console.debug("Card Hotbar | macro provided:", macro, "fromSlot", data.cardSlot);
      console.debug("Card Hotbar | monkey hotpatch?", game.user.assignHotbarMacro === this.assigncardHotbarMacro);
        //set macro at destination
        //await this.assigncardHotbarMacro(macro, cardSlot, {fromSlot: data.cardSlot});
        //swap macros if needed
        console.debug(`Card Hotbar | From ${data.cardSlot} (${ui.cardHotbar.populator.chbGetMacro(data.cardSlot)}) to ${cardSlot} (${ui.cardHotbar.populator.chbGetMacro(cardSlot)})`);
        let dstMacro = game.macros.get( ui.cardHotbar.populator.chbGetMacro(cardSlot) );
        console.debug(dstMacro);
        if ( dstMacro ) {
          await this.assigncardHotbarMacro(macro, cardSlot);
          await this.assigncardHotbarMacro(dstMacro, data.cardSlot);
        } else {
          //set macro at destination. technically this should never be called under current implementation
          console.debug("Card Hotbar | Destination slot empty?");
          await this.assigncardHotbarMacro(macro, cardSlot, {fromSlot: data.cardSlot});
        }
        
    }


  }

  /* -------------------------------------------- */

  /**
   * Handle left-click events too
   * @param event
   * @private
   */
  async _onClickMacro(event) {
    //console.debug("card macro click detected!");

    event.preventDefault();
    const li = event.currentTarget;

    /* Case DEPRECATED - draw a card
    if ( li.classList.contains("next") ) {
      //console.debug("Card Hotbar | Drawing 1 card from current deck...");
      let deck = game.decks.get( game.user.getFlag("world", "sdf-deck-cur") );
      let card = await deck.drawCard();
      ui.cardHotbar.populator.addToHand([card]);
    } */

    // Case 1 - trigger a Macro
    //abort if card is face down
    const macro = game.macros.get(li.dataset.macroId);
    if (macro.getFlag("world","sideUp") == "back") return;
    return macro.execute();

    //TO DO: Add additional logic to run card macros stored in the card instead if present
  }

  /* -------------------------------------------- */

  /** @override */
  _onDragStart(event) {
    //hide tooltip so it doesn't get in the way
    //console.debug("Card Hotbar | Attempting to hide tooltip.");

    const li = event.currentTarget.closest(".macro");
    if ( !li.dataset.macroId ) return false;
    document.getElementsByClassName("tooltip")[0].style.display = "none";
    const dragData = { type: "Macro", id: li.dataset.macroId, cardSlot: li.dataset.slot };
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    console.debug("Card Hotbar | Source:"); 
    console.debug(li);
  }





  /**
   * Get the Macro entity being dropped in the cardHotbar. If the data comes from a non-World source, create the Macro
   * @param {Object} data             The data transfer attached to the DragEvent
   * @return {Promise<Macro|null>}    A Promise which returns the dropped Macro, or null
   * @private
   */
  async _getDropMacro(data) {
    //console.debug("Card Hotbar | in _getDropMacro", data);
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
    const hasAction = ( !li.classList.contains("inactive") );

    // Remove any existing tooltip
    const tooltip = li.querySelector(".tooltip");
    if ( tooltip ) li.removeChild(tooltip);

    // Handle hover-in
    if ( event.type === "mouseenter" ) {
      //console.debug("Card Hotbar | Macro tooltip override fired!");
      this._hover = li.dataset.slot;
      if ( hasAction ) {
        const macro = game.macros.get(li.dataset.macroId);
        const tooltip = document.createElement("SPAN");
        tooltip.classList.add("tooltip");
        let sideUp = macro.getFlag("world","sideUp"); 
        !sideUp || sideUp == "front" ? tooltip.textContent = macro.name : tooltip.textContent="???";
        li.appendChild(tooltip);
      } 
    
      else {
        const tooltip = document.createElement("SPAN");
        //add better name getting logic.
        let curDeck = game.folders.get( game.user.getFlag("world","sdf-deck-cur") ).name || "None"
        tooltip.classList.add("tooltip");
        tooltip.textContent = `Deck: ${curDeck}. Click to draw or right-click.`;
        li.appendChild(tooltip);
      }
    
    }

    // Handle hover-out
    else {
      this._hover = null;
    }
  }
}