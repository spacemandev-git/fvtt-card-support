import { cardHotbarPopulator }  from './scripts/card-hotbar-populator.js';
import { cardHotbar }  from './card-hotbar.js';
import { cardHotbarSettings } from './scripts/card-hotbar-settings.js';

async function cardHotbarInit() {
  //console.debug("Card Hotbar | Initializing...");
  window.cardHotbar = new cardHotbarPopulator();
  ui.cardHotbar = new cardHotbar(window.cardHotbar);
  //ui.cardHotbar = ui.cardHotbar.getData(options);
  let obj = {
      left: 100,
      top: 100,
      width: 502,
      height: 52,
      scale: 1.0,
      log: true,
      renderContext: "card-hotbar",
      renderData: "init"
  };


  cardHotbarSettings.register();

  //apply settings styles, first for card hotbar, then for core hotbar
  //For each setting, use flag if present, otherwise use game setting.

   var css =
      '#card-hotbar' 
    + ` { bottom: ${cardHotbarSettings.getCHBYPos()}px; ` 
    + `   left: ${cardHotbarSettings.getCHBXPos()}px; `
    + ' }'
/*
    + '#card-hotbar #card-macro-list' 
    + ` {` 
    + `   border: 1px solid ${cardHotbarSettings.getCHBBorderColor()};`
    + ' }'
*/    
    + '#card-hotbar .bar-controls'
/* Hard-coded for now */ 
    + ` { background: #00000080;` 
    + `   border: 1px solid ${cardHotbarSettings.getCHBBorderColor()};`
    + ' }'

    + '#card-hotbar .macro' 
    + ` { background: ${cardHotbarSettings.getCHBPrimaryColor()};`
    + ' }'

    + '#card-macro-list li.macro.active.marked' 
    + ' { '  	
    + '   position: relative;'
    + ' } '

    + '#card-macro-list li.macro.marked:after' 
    + ' { '  	
    + '   position: absolute;'
    + '   height: 100%;'
    + '   width: 100%;'
    + `   background-color: ${cardHotbarSettings.getCHBMarkedColor()};`
    + '   top: 0;'
    + '   left: 0;'
    + '   display: block;'
    + '   content: "";'
    + ' } '

  , head = document.head || document.getElementsByTagName('head')[0]
  , style = document.createElement('style');

  head.appendChild(style);

  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));

//  ui.hotbar.render();

  Array.from(document.getElementsByClassName("macro")).forEach(function (element) {
    element.ondragstart = ui.hotbar._onDragStart;
    element.ondragend = ui.hotbar._onDrop;
  });

  /* Add support for dragging tile from canvas onto hotbar later
  //add handler for dragging tiles onto hotbar, with thanks to Vance
  let dragging = false;

  //only trigger for card tiles
  const ogPlaceableObject = PlaceableObject.prototype._onDragLeftStart;
  PlaceableObject.prototype._onDragLeftStart = function (...args) { 
  const e = args[0];
  let tokens = e.data.clones;
  if (tokens) {
    dragging = tokens[0].actor;
    console.log(`Picked up: ${dragging.data.name}`);
  }
  return ogPlaceableObject.apply(this, args);
  }

  $(document).mouseup((e) => {
    if(dragging) {
      console.log(`Dropped: ${dragging.data.name} onto ${e.target}`);
      dragging = false;
    }
  })
*/
  ui.cardHotbar.populator.compact();
  ui.cardHotbar.render(true, obj);
  await ui.cardHotbar.populator._updateFlags();
}


Hooks.once("init", async () => {
  CONFIG.ui.hotbar = class extends Hotbar {
    _onDragStart(...arg) {
      document.getElementsByClassName("tooltip")[0].style.display = "none";
      super._onDragStart(...arg);
    }
  };
});

Hooks.once('ready', () => {
  //console.debug("Card Hotbar | Foundry setup...");

  //Check to make sure that a hotbar rendered before initilizing so that PopOut module windows do not have unwanted card hotbars.
  let hotbarTest = ui.hotbar;
  //console.debug("Card Hotbar | Core Foundry Hotbar Present?");
  //console.debug(hotbarTest);
 
  if ( hotbarTest ) {
    cardHotbarInit();
  }

});

Hooks.on("renderSettingsConfig", async () => {
  //add CSS ids and classes to cardHotbar settings section for styling
  let settingsDiv = document.getElementById("client-settings");
  
  let chbSetDiv = $( `#${settingsDiv.id} div h2.module-header:contains("Card Support (Unofficial)")` ).next();
  $(chbSetDiv).addClass('chb-setting');
  $(chbSetDiv).addClass('chb-global');
  $(chbSetDiv).attr('id', 'chbSetDiv');

  let chbFlagDiv = $(chbSetDiv).next();
  $(chbFlagDiv).addClass('chb-setting');
  $(chbFlagDiv).addClass('chb-user');
  $(chbFlagDiv).attr('id', 'chbFlagDiv');

});

Hooks.on("hotbarDrop", (hotbar, data, slot) => {
  //console.debug("Card Hotbar | Creating Macro")
  if (data.type !== "JournalEntry") return true;
  const journal = game.journal.get(data.id);
  if (!journal) return true;
  // Make a new macro for the Journal
  Macro.create({
      name: `Card: ${journal.name}`,
      type: "script",
      flags: {
        "world": {
          "cardID": `${journal.id}`,
        }
      },
      scope: "global",
      //Change first argument to "text" to show the journal entry as default.
      //NOTE: In order for this macro to work (0.6.5 anyway) there MUST be text (content attribute must not be null).
      command: `game.journal.get("${journal.id}").show("image", false);`,

      img: `${game.journal.get(journal.id).data.img}`
  }).then(macro => {
      game.user.assignHotbarMacro(macro, slot);
  });
  return false;
});

Hooks.once('rendercardHotbar', () => {
  //console.debug("Card Hotbar | Performing initial collapse");
  ui.cardHotbar.collapse();
});

Hooks.on("renderHotbar", async () => {
  //console.debug("Card Hotbar | The core hotbar just rendered!");
});

Hooks.on('rendercardHotbar', async () => {
  //console.debug("Card Hotbar | The card hotbar just rendered!");
});

/* NOTE: ERRORS/ISSUES WITH CORE HOTBAR (LOL, SHRUG)
0.6.5, DND 5E 0.94 (ALL MODS DISABLED)

1. file directory to canvas: 
foundry.js:29725 Uncaught (in promise) Error: No available Hotbar slot exists
at User.assignHotbarMacro (foundry.js:29725)
at Canvas._onDrop (foundry.js:11425)
at DragDrop.callback (foundry.js:13785)
at DragDrop._handleDrop (foundry.js:13836)

2. Macro execute for spell, than cancel : uncaught in promise, 5e error?) (last tested in 0.9.3 an 0.6.4)

3. Drag macro onto itself, it is removed

4. Sometimes when you drag off of core, a ghost set of slots to left and right of core slot is grabbed also. Seems to happen if you click on the keyboard shortcut span.
*/
