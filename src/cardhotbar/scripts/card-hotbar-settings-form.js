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
            title: "(𝗚𝗠 𝗢𝗻𝗹𝘆) Set Default Global card Hotbar",
            template: "./modules/card-hotbar/templates/cardHotbarSettings.html",
            classes: ["sheet"],
            width: 500,
            closeOnSubmit: true
        });
    }

    getData() {
        let data = {        
            chbPrimaryColor: game.settings.get("card-hotbar", "chbPrimaryColor"), 
            chbBorderColor: game.settings.get("card-hotbar", "chbBorderColor"),
            chbBorderColorActive: game.settings.get("card-hotbar", "chbBorderColorActive"),
            chbBorderColorInactive: game.settings.get("card-hotbar", "chbBorderColorInactive"),

            chbXPos: game.settings.get("card-hotbar", "chbXPos"),
            chbYPos: game.settings.get("card-hotbar", "chbYPos")
        };
        if (this.reset == true) {
            data = {    
                chbPrimaryColor: game.settings.settings.get("card-hotbar.chbPrimaryColor").default,
                chbBorderColor: game.settings.settings.get("card-hotbar.chbBorderColor").default,
                chbBorderColorActive: game.settings.settings.get("card-hotbar.chbBorderColorActive").default,
                chbBorderColorInactive: game.settings.settings.get("card-hotbar.chbBorderColorInactive").default,

                chbXPos: game.settings.settings.get("card-hotbar.chbXPos").default,
                chbYPos: game.settings.settings.get("card-hotbar.chbYPos").default
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
        console.debug("card Hotbar | Attempting to update settings with form values...");
        game.settings.set("card-hotbar", "chbPrimaryColor", d.chbPrimaryColor);
        game.settings.set("card-hotbar", "chbBorderColor", d.chbBorderColor);
        game.settings.set("card-hotbar", "chbBorderColorActive", d.chbBorderColorActive);
        game.settings.set("card-hotbar", "chbBorderColorInactive", d.chbBorderColorInactive);
        game.settings.set("card-hotbar","chbXPos", d.chbXPos);
        game.settings.set("card-hotbar","chbYPos", d.chbYPos);
        this.render();
        ui.notifications.notify("Saving... Please refresh Foundry to apply changes.");                                                     
    }

    onReset() {
        console.debug("card Hotbar | Attempting to reset chbSettingsForm to defaults");
        this.reset = true;
        this.render();
    }

    onChbPrimaryColorClick() {
        console.debug("card Hotbar | chbPrimaryColor button click detected");
        $( event.target ).addClass("expanded");
        //$( event.target ).prop( "disabled", true );
 
// Enable #x
$( "#x" ).prop( "disabled", false );
    }

    onChbBorderColorClick() {
        console.debug("card Hotbar | chbBorderColor button click detected");
        $( event.target ).addClass("expanded");
    }

    onChbBorderColorActiveClick() {
        console.debug("card Hotbar | chbBorderColorActive button click detected");
        $( event.target ).addClass("expanded");
    }

    onChbBorderColorInactiveClick() {
        console.debug("card Hotbar | chbBorderColorInactive button click detected");
        $( event.target ).addClass("expanded");
    }

    activateListeners(html) {
        console.debug("card Hotbar | Attempting to activate CHB Settings Form listeners");
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

Hooks.on("rendercardHotbarSettingsForm", (a, b, c) => {
    console.debug( "card Hotbar | Initializing current color values..." );
    $( "#chbPrimaryColorSplash" ).css("background-color", c.chbPrimaryColor);
    $( "#chbBorderColorSplash" ).css("background-color", c.chbBorderColor);
    $( "#chbBorderColorActiveSplash" ).css("background-color", c.chbBorderColorActive);
    $( "#chbBorderColorInactiveSplash" ).css("background-color", c.chbBorderColorInactive);
});

Hooks.on("pickerDone", (parentDiv, hexColor) => {
    console.debug("card Hotbar | pickerDone hook detected");
    $( parentDiv ).find("input").removeClass("expanded");
    //$( parentDiv ).find("input").prop( "disabled", true );
    $( parentDiv ).css("background-color", hexColor);
});