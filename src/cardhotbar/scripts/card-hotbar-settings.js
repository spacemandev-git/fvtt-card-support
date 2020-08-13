import { cardHotbarSettingsForm } from './card-hotbar-settings-form.js';
import { cardHotbarFlagsForm } from './card-hotbar-flags-form.js';

export class cardHotbarSettings {
    /**
     * Provides functionality for interaction with module settings and Flags
     */

    static register(){
    //Global, GM-only settings menus
        game.settings.registerMenu("cardsupport", 'chbSettingsMenu', {
            name: '(𝗚𝗠 𝗢𝗻𝗹𝘆) Default Player Hand Settings for All Users',
            label: 'Global Player Hand',
            icon: 'fas fa-bars',
            type: cardHotbarSettingsForm,
            restricted: true
        });

        //TO DO: add hotbarPageKeyEnabled and chbKeyEnabled and fix settings window formatting and add to localizations
        /*                                     module        key             options
        game.settings.register("card-hotbar", "chbKeyEnabled", {
            name: "cardHotbar.settings.chbKeyEnabled.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.chKeyEnabled.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            config: false,                 // Disable display on the standard Foundry settings menu
            default: "#0000FF80",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        })
        */

        //User-only "settings" menu that uses flags instead
        game.settings.registerMenu("cardsupport", 'chbFlagsMenu', {
            name: 'Your Hand of Cards Settings',
            label: 'Your Hand of Cards',
            icon: 'fas fa-bars',
            type: cardHotbarFlagsForm,
            restricted: false
        });

        //TO DO: add hotbarPageKeyEnabled and chbKeyEnabled
    
    //CARD HOTBAR SETTINGS    

        //                                     module        key             options
        game.settings.register("cardsupport", "chbPrimaryColor", {
            name: "cardHotbar.settings.chbPrimaryColor.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.chbPrimaryColor.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            config: false,                 // Disable display on the standard Foundry settings menu
            default: "#99999980",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        })
     
        //                                     module        key             options
        game.settings.register("cardsupport", "chbBorderColor", {
            name: "cardHotbar.settings.chbBorderColor.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.chbBorderColor.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#999999ff",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        })

        //                                     module        key             options
        game.settings.register("cardsupport", "chbBorderColorActive", {
            name: "cardHotbar.settings.chbBorderColorActive.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.chbBorderColorActive.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#ffffffff",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        })  

        //                                     module        key             options
        game.settings.register("cardsupport", "chbBorderColorInactive", {
            name: "cardHotbar.settings.chbBorderColorInactive.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.chbBorderColorInactive.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#000000ff",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.cardHotbar.render();}        // A callback function which triggers when the setting is changed
        })   

        game.settings.register("cardsupport", "chbXPos", {
            name: "cardHotbar.settings.chbXPos.name",
            hint: "cardHotbar.settings.chbXPos.nameHint",
            scope: "world",
            config: false,
            default: "220",
            type: Number,
            onChange: value => {
                ui.cardHotbar.render();
            }
        }); 

        game.settings.register("cardsupport", "chbYPos", {
            name: "cardHotbar.settings.chbYPos.name",
            hint: "cardHotbar.settings.chbYPos.nameHint",
            scope: "world",
            config: false,
            default: "63",
            type: Number,
            onChange: value => {
                ui.cardHotbar.render();
            }
        }); 

        //Add ZPos set to uneditable?

    //CORE HOTBAR SETTINGS
        //                                     module        key             options
        game.settings.register("cardsupport", "corePrimaryColor", {
            name: "cardHotbar.settings.corePrimaryColor.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.corePrimaryColor.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#00000080",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.hotbar.render();}        // A callback function which triggers when the setting is changed
        })
     
        //                                     module        key             options
        game.settings.register("cardsupport", "coreBorderColor", {
            name: "cardHotbar.settings.coreBorderColor.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.coreBorderColor.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#000000ff",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.hotbar.render();}        // A callback function which triggers when the setting is changed
        })

        //                                     module        key             options
        game.settings.register("cardsupport", "coreBorderColorActive", {
            name: "cardHotbar.settings.coreBorderColorActive.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.coreBorderColorActive.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#ff6400",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.hotbar.render();}        // A callback function which triggers when the setting is changed
        })

        //                                     module        key             options
        game.settings.register("cardsupport", "coreBorderColorInactive", {
            name: "cardHotbar.settings.coreBorderColorInactive.name",      // The name of the setting in the settings menu
            hint: "cardHotbar.settings.coreBorderColorInactive.nameHint",   // A description of the registered setting and its behavior
            label: "Color Picker",         // The text label used in the button
            restricted: false,             // Restrict this setting to gamemaster only?
            default: "#939799ff",     // The default color of the setting
            type: String,
            scope: "world",               // The scope of the setting
            config: false,                 // Disable display on the standard Foundry settings menu
            onChange: (value) => {ui.hotbar.render();}        // A callback function which triggers when the setting is changed
        })   

        game.settings.register("cardsupport", "coreXPos", {
            name: "cardHotbar.settings.coreXPos.name",
            hint: "cardHotbar.settings.coreXPos.nameHint",
            scope: "world",
            config: false,
            default: "220",
            type: Number,
            onChange: value => {
                ui.hotbar.render();
            }
        }); 

        game.settings.register("cardsupport", "coreYPos", {
            name: "cardHotbar.settings.coreYPos.name",
            hint: "cardHotbar.settings.coreYPos.nameHint",
            scope: "world",
            config: false,
            default: "10",
            type: Number,
            onChange: value => {
                ui.hotbar.render();
            }
        }); 
    }

    //getters that determine whether to grab the user flag or the setting
    //Card Hotbar getters
    //refactor into one function with variable for what you are getting when get chance?
    static getCHBPrimaryColor(){
        var flag = game.user.getFlag("cardsupport", "chbPrimaryColor");
        var sett = game.settings.get("cardsupport","chbPrimaryColor");
        return (flag) ? flag : sett;
    }

    static getCHBBorderColor(){
        var flag = game.user.getFlag("cardsupport", "chbBorderColor");
        var sett = game.settings.get("cardsupport","chbBorderColor");
        return (flag) ? flag : sett;
    }

    static getCHBBorderColorActive(){
        var flag = game.user.getFlag("cardsupport", "chbBorderColorActive");
        var sett = game.settings.get("cardsupport","chbBorderColorActive");
        return (flag) ? flag : sett;
    }
    
    static getCHBBorderColorInactive(){
        var flag = game.user.getFlag("cardsupport", "chbBorderColorInactive");
        var sett = game.settings.get("cardsupport","chbBorderColorInactive");
        return (flag) ? flag : sett;
    }

    static getCHBXPos(){
        var flag = game.user.getFlag("cardsupport", "chbXPos");
        var sett = game.settings.get("cardsupport","chbXPos");
        return (flag) ? flag : sett;
    }

    static getCHBYPos(){
        var flag = game.user.getFlag("cardsupport", "chbYPos");
        var sett = game.settings.get("cardsupport","chbYPos");
        return (flag) ? flag : sett;
    }

    //Core Hotbar getters
    static getCorePrimaryColor(){
        var flag = game.user.getFlag("cardsupport", "corePrimaryColor");
        var sett = game.settings.get("cardsupport","corePrimaryColor");
        return (flag) ? flag : sett;
    }

    static getCoreBorderColor(){
        var flag = game.user.getFlag("cardsupport", "coreBorderColor");
        var sett = game.settings.get("cardsupport","coreBorderColor");
        return (flag) ? flag : sett;
    }

    static getCoreBorderColorActive(){
        var flag = game.user.getFlag("cardsupport", "coreBorderColorActive");
        var sett = game.settings.get("cardsupport","coreBorderColorActive");
        return (flag) ? flag : sett;
    }
    
    static getCoreBorderColorInactive(){
        var flag = game.user.getFlag("cardsupport", "coreBorderColorInactive");
        var sett = game.settings.get("cardsupport","coreBorderColorInactive");
        return (flag) ? flag : sett;
    }

    static getCoreXPos(){
        var flag = game.user.getFlag("cardsupport", "coreXPos");
        var sett = game.settings.get("cardsupport","coreXPos");
        return (flag) ? flag : sett;
    }

    static getCoreYPos(){
        var flag = game.user.getFlag("cardsupport", "coreYPos");
        var sett = game.settings.get("cardsupport","coreYPos");
        return (flag) ? flag : sett;
    }
}