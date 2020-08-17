export class cardHotbarSettingsForm extends FormApplication {

    constructor(object, options = {}) {
        super(object, options);
    }

    /**
    * Default Options for this FormApplication
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "card-hotbar-settings-form",
            title: "(𝗚𝗠 𝗢𝗻𝗹𝘆) Set Default Global Player Hand",
            template: "./modules/cardsupport/cardhotbar/templates/cardHotbarSettings.html",
            classes: ["sheet"],
            width: 500,
            closeOnSubmit: true
        });
    }

    getData() {
        let data = {   
            chbDrawFaceUp: game.settings.get("cardsupport", "chbDrawFaceUp"),
            chbCardScale: game.settings.get("cardsupport", "chbCardScale"),        
            chbPrimaryColor: game.settings.get("cardsupport", "chbPrimaryColor"), 
            chbBorderColor: game.settings.get("cardsupport", "chbBorderColor"),
            chbBorderColorActive: game.settings.get("cardsupport", "chbBorderColorActive"),

            chbXPos: game.settings.get("cardsupport", "chbXPos"),
            chbYPos: game.settings.get("cardsupport", "chbYPos")
        };
        if (this.reset == true) {
            data = {
                chbDrawFaceUp: game.settings.settings.get("cardsupport.chbDrawFaceUp").default,
                chbCardScale: game.settings.settings.get("cardsupport.chbCardScale").default,    
                chbPrimaryColor: game.settings.settings.get("cardsupport.chbPrimaryColor").default,
                chbBorderColor: game.settings.settings.get("cardsupport.chbBorderColor").default,
                chbBorderColorActive: game.settings.settings.get("cardsupport.chbBorderColorActive").default,

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
        //console.debug("card Hotbar | Attempting to update settings with form values...");
        //console.debug(d.chbDrawFaceUp);
        game.settings.set("cardsupport", "chbDrawFaceUp", d.chbDrawFaceUp);
        game.settings.set("cardsupport", "chbCardScale", d.chbCardScale);
        game.settings.set("cardsupport", "chbPrimaryColor", d.chbPrimaryColor);
        game.settings.set("cardsupport", "chbBorderColor", d.chbBorderColor);
        game.settings.set("cardsupport", "chbBorderColorActive", d.chbBorderColorActive);
        game.settings.set("cardsupport","chbXPos", d.chbXPos);
        game.settings.set("cardsupport","chbYPos", d.chbYPos);
        this.render();
        ui.notifications.notify("Saving... Please refresh Foundry to apply changes.");                                                     
    }

    onReset() {
        //console.debug("card Hotbar | Attempting to reset chbSettingsForm to defaults");
        this.reset = true;
        this.render();
    }

    onChbPrimaryColorClick() {
        //console.debug("card Hotbar | chbPrimaryColor button click detected");
        $( event.target ).addClass("expanded");
        //$( event.target ).prop( "disabled", true );
 
// Enable #x
$( "#x" ).prop( "disabled", false );
    }

    onChbBorderColorClick() {
        //console.debug("card Hotbar | chbBorderColor button click detected");
        $( event.target ).addClass("expanded");
    }

    onChbBorderColorActiveClick() {
        //console.debug("card Hotbar | chbBorderColorActive button click detected");
        $( event.target ).addClass("expanded");
    }

    activateListeners(html) {
        //console.debug("card Hotbar | Attempting to activate CHB Settings Form listeners");
        super.activateListeners(html);
        //bind buttons and inputs 
        html.find('button[name="reset"]').on('click', this.onReset.bind(this));
        html.find('input[name="chbPrimaryColor"]').on('click',this.onChbPrimaryColorClick.bind(this));
        html.find('input[name="chbBorderColor"]').on('click',this.onChbBorderColorClick.bind(this));
        html.find('input[name="chbBorderColorActive"]').on('click',this.onChbBorderColorActiveClick.bind(this));
        this.reset = false;
    }
}

Hooks.on("rendercardHotbarSettingsForm", (a, b, c) => {
    //console.debug( "card Hotbar | Initializing current color values..." );
    $( "#chbPrimaryColorSplash" ).css("background-color", c.chbPrimaryColor);
    $( "#chbBorderColorSplash" ).css("background-color", c.chbBorderColor);
    $( "#chbBorderColorActiveSplash" ).css("background-color", c.chbBorderColorActive);
});

Hooks.on("pickerDone", (parentDiv, hexColor) => {
    //console.debug("card Hotbar | pickerDone hook detected");
    $( parentDiv ).find("input").removeClass("expanded");
    //$( parentDiv ).find("input").prop( "disabled", true );
    $( parentDiv ).css("background-color", hexColor);
});