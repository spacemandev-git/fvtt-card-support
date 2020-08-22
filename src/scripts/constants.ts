export const mod_scope = "world";
export const mod_name = 'sdf-decks'

// Flags
//cardData //on cards
//cardMacros
//cardBack 
//deckState //on folders

//Tile Flags
//deckID //on Deck Tiles 
//cardID //on Card Tiles


export interface SocketMessage {
  type: "DEAL" | "GIVE",
  deck: string,
  from: string,
  to: string,
  cardIDs: string[]
}