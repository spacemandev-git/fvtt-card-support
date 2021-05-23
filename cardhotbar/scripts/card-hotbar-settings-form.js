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
      template:
        "./modules/cardsupport/cardhotbar/templates/cardHotbarSettings.html",
      classes: ["sheet"],
      width: 500,
      closeOnSubmit: true,
    });
  }

  getData() {
    let data = {
      chbDrawFaceUpHand: game.settings.get("cardsupport", "chbDrawFaceUpHand"),
      chbDrawFaceUpTable: game.settings.get(
        "cardsupport",
        "chbDrawFaceUpTable"
      ),
      chbCardScale: game.settings.get("cardsupport", "chbCardScale"),
      chbPrimaryColor: game.settings.get("cardsupport", "chbPrimaryColor"),
      chbBorderColor: game.settings.get("cardsupport", "chbBorderColor"),
      chbMarkedColor: game.settings.get("cardsupport", "chbMarkedColor"),

      chbXPos: game.settings.get("cardsupport", "chbXPos"),
      chbYPos: game.settings.get("cardsupport", "chbYPos"),
    };
    if (this.reset == true) {
      data = {
        chbDrawFaceUpHand: game.settings.settings.get(
          "cardsupport.chbDrawFaceUpHand"
        ).default,
        chbDrawFaceUpTable: game.settings.settings.get(
          "cardsupport.chbDrawFaceUpTable"
        ).default,
        chbCardScale: game.settings.settings.get("cardsupport.chbCardScale")
          .default,
        chbPrimaryColor: game.settings.settings.get(
          "cardsupport.chbPrimaryColor"
        ).default,
        chbBorderColor: game.settings.settings.get("cardsupport.chbBorderColor")
          .default,
        chbMarkedColor: game.settings.settings.get("cardsupport.chbMarkedColor")
          .default,

        chbXPos: game.settings.settings.get("cardsupport.chbXPos").default,
        chbYPos: game.settings.settings.get("cardsupport.chbYPos").default,
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
    //console.debug(d.chbDrawFaceUpHand);
    //console.debug(d.chbDrawFaceUpTable);
    game.settings.set("cardsupport", "chbDrawFaceUpHand", d.chbDrawFaceUpHand);
    game.settings.set(
      "cardsupport",
      "chbDrawFaceUpTable",
      d.chbDrawFaceUpTable
    );
    game.settings.set("cardsupport", "chbCardScale", d.chbCardScale);
    game.settings.set("cardsupport", "chbPrimaryColor", d.chbPrimaryColor);
    game.settings.set("cardsupport", "chbBorderColor", d.chbBorderColor);
    game.settings.set("cardsupport", "chbMarkedColor", d.chbMarkedColor);
    game.settings.set("cardsupport", "chbXPos", d.chbXPos);
    game.settings.set("cardsupport", "chbYPos", d.chbYPos);
    this.render();
    ui.notifications.notify(
      "Saving... Please note that changes to colors require a Foundry refresh."
    );
  }

  onReset() {
    //console.debug("card Hotbar | Attempting to reset chbSettingsForm to defaults");
    this.reset = true;
    this.render();
  }

  onChbPrimaryColorClick() {
    //console.debug("card Hotbar | chbPrimaryColor button click detected");
    $(event.target).addClass("expanded");
    //$( event.target ).prop( "disabled", true );

    // Enable #x
    $("#x").prop("disabled", false);
  }

  onChbBorderColorClick() {
    //console.debug("card Hotbar | chbBorderColor button click detected");
    $(event.target).addClass("expanded");
  }

  onChbMarkedColorClick() {
    //console.debug("card Hotbar | chbMarkedColor button click detected");
    $(event.target).addClass("expanded");
  }

  activateListeners(html) {
    //console.debug("card Hotbar | Attempting to activate CHB Settings Form listeners");
    super.activateListeners(html);
    //bind buttons and inputs
    html.find('button[name="reset"]').on("click", this.onReset.bind(this));
    html
      .find('input[name="chbPrimaryColor"]')
      .on("click", this.onChbPrimaryColorClick.bind(this));
    html
      .find('input[name="chbBorderColor"]')
      .on("click", this.onChbBorderColorClick.bind(this));
    html
      .find('input[name="chbMarkedColor"]')
      .on("click", this.onChbMarkedColorClick.bind(this));
    this.reset = false;
  }
}

Hooks.on("rendercardHotbarSettingsForm", (a, b, c) => {
  //console.debug( "card Hotbar | Initializing current color values..." );
  $("#chbPrimaryColorSplash").css("background-color", c.chbPrimaryColor);
  $("#chbBorderColorSplash").css("background-color", c.chbBorderColor);
  $("#chbMarkedColorSplash").css("background-color", c.chbMarkedColor);
});

Hooks.on("pickerDone", (parentDiv, hexColor) => {
  //console.debug("card Hotbar | pickerDone hook detected");
  $(parentDiv).find("input").removeClass("expanded");
  //$( parentDiv ).find("input").prop( "disabled", true );
  $(parentDiv).css("background-color", hexColor);
});
