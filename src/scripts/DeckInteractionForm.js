export class DeckInteractionForm extends FormApplication {
  constructor(obj, opts = {}) {
    super(obj, opts);
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "deckinteractionform",
      title: "Decks",
      template: "modules/cardsupport/templates/deckinteractionform",
      classes: ["sheet"],
    });
  }
  getData() {
    let data = {
      decks: game.decks.decks,
    };
    return data;
  }
  activateListeners(html) {}
}
