import { cardHotbarSettings } from './card-hotbar-settings.js';

export class cardHotbarFlagsForm extends FormApplication {

    constructor(object, options = {}) {
        super(object, options);
    }

    /**
    * Default Options for this FormApplication
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "card-hotbar-flags-form",
            title: "(Per User) Your card Hotbar Settings",
            template: "./modules/cardsupport/cardhotbar/templates/cardHotbarFlags.html",
            classes: ["sheet"],
            width: 500,
            closeOnSubmit: true
        });
    }

    getData() {
        let data = {        
            chbPrimaryColor: cardHotbarSettings.getCHBPrimaryColor(), 
            chbBorderColor: cardHotbarSettings.getCHBBorderColor(),
            chbBorderColorActive: cardHotbarSettings.getCHBBorderColorActive(),
            chbBorderColorInactive: cardHotbarSettings.getCHBBorderColorInactive(),

            chbXPos: cardHotbarSettings.getCHBXPos(),
            chbYPos: cardHotbarSettings.getCHBYPos(),        };
        if (this.reset == true) {
            data = {    
                chbPrimaryColor: game.settings.settings.get("cardsupport.chbPrimaryColor").default,
                chbBorderColor: game.settings.settings.get("cardsupport.chbBorderColor").default,
                chbBorderColorActive: game.settings.settings.get("cardsupport.chbBorderColorActive").default,
                chbBorderColorInactive: game.settings.settings.get("cardsupport.chbBorderColorInactive").default,

                chbXPos: game.settings.settings.get("cardsupport.chbXPos").default,
                chbYPos: game.settings.settings.get("cardsupport.chbYPos").default
            };
        }
        this.render;
        return data;
    }

    /** 
     * Executes on form submission.
     * @param {Object} e - the form submission event
     * @param {Object} d - the form data
     *
     *  'name': entry.metadata.label+' ['+entry.metadata.package+']',
     *  'type':'pack',
     *  'submenu':submenu.toLowerCase(),
     *  'key':entry.metadata.package+'.'+entry.metadata.name
     */
    async _updateObject(e, d) {
        await game.user.setFlag("cardsupport", "chbPrimaryColor", d.chbPrimaryColor);
        await game.user.setFlag("cardsupport", "chbBorderColor", d.chbBorderColor);
        await game.user.setFlag("cardsupport", "chbBorderColorActive", d.chbBorderColorActive);
        await game.user.setFlag("cardsupport", "chbBorderColorInactive", d.chbBorderColorInactive);

        await game.user.setFlag("cardsupport","chbXPos", d.chbXPos);
        await game.user.setFlag("cardsupport","chbYPos", d.chbYPos);
        this.render();
        ui.notifications.notify("Saving... Please refresh Foundry to apply changes.");                                                     
    }

    onReset() {
        //console.debug("card Hotbar | Attempting to reset card-hotbar-flags-form to defaults");
        this.reset = true;
        this.render();
    }

    onChbPrimaryColorClick() {
        //console.debug("card Hotbar | chbPrimaryColor button click detected");
        $( event.target ).addClass("expanded");
    }

    onChbBorderColorClick() {
        //console.debug("card Hotbar | chbBorderColor button click detected");
        $( event.target ).addClass("expanded");
    }

    onChbBorderColorActiveClick() {
        //console.debug("card Hotbar | chbBorderColorActive button click detected");
        $( event.target ).addClass("expanded");
    }

    onChbBorderColorInactiveClick() {
        //console.debug("card Hotbar | chbBorderColorInactive button click detected");
        $( event.target ).addClass("expanded");
    }

    activateListeners(html) {
        //console.debug("card Hotbar | Attempting to activate  CHB Flags Form listeners");
        super.activateListeners(html);
        //bind buttons and inputs 
        html.find('button[name="reset"]').on('click', this.onReset.bind(this));
        html.find('input[name="chbPrimaryColor"]').on('click',this.onChbPrimaryColorClick.bind(this));
        html.find('input[name="chbBorderColor"]').on('click',this.onChbBorderColorClick.bind(this));
        html.find('input[name="chbBorderColorActive"]').on('click',this.onChbBorderColorActiveClick.bind(this));
        html.find('input[name="chbBorderColorInactive"]').on('click',this.onChbBorderColorInactiveClick.bind(this));
        this.reset = false;
    }
}

Hooks.on("rendercardHotbarFlagsForm", (a, b, c) => {
    //console.debug( "card Hotbar | Initializing current color values..." );
    $( "#chbPrimaryColorSplash" ).css("background-color", c.chbPrimaryColor);
    $( "#chbBorderColorSplash" ).css("background-color", c.chbBorderColor);
    $( "#chbBorderColorActiveSplash" ).css("background-color", c.chbBorderColorActive);
    $( "#chbBorderColorInactiveSplash" ).css("background-color", c.chbBorderColorInactive);
});

Hooks.on("pickerDone", (parentDiv, hexColor) => {
    //console.debug("card Hotbar | pickerDone hook detected");
    $( parentDiv ).find("input").removeClass("expanded");
    $( parentDiv ).css("background-color", hexColor);
});