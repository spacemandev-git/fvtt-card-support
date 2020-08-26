## TO DO
CARDHOTBAR:
v1
1. Playing card from hand should remove it from the hand (DONE)
2. ALT+Dragging from hand should play the card hidden (DONE)
3. Swapping cards in bar should not delete the cards. (DONE)
4. Remove / Hiding elements that aren't working  (DONE)
5. Flipping cards in hand (DONE)
6. Compact Hand function and rework addToHand() accordingly (DONE)
7. Get Player Hand 
8. Mark Cards as done (DONE)

v2
1. Paging/longer hotbar/support for more cards (DONE except styling)

v3+
1. Multiple Hands
2. Hands per Token

SDF DECKS:
v1
1. Dragging a folder onto the table turns it into a tile object with a HUD that lets you draw cards from it like a deck (DONE)
2. Add discard back to main deck without resetting deck (DONE)
3. View Discard Pile (DONE)
6. Infinite Draw
7. Take as Copy

###################### 1.1
- Infinite Draw (DONE)
- Take as Copy from View Deck (DONE)
- Draw to Table (DONE)
- Auto Import Standard Deck on Load (DONE)
- Video Explanation (DONE)

- Register and Call Hooks for Deck Init
- Deal to Players (Requires Sockets)
- Card Add GUI

###################### 1.2
- Change Decks &  Tiles to Actors instead of Tiles (DONE)
- Add a way to import cards from folder of images (DONE)
- Add a GUI to append to a Deck (DONE)

####################### 1.3
- Deal to Players / Draw For Players (DONE)
- Give to Player (DONE)
- Reset Deck should delete all copies of cards in players hands (DONE)


###################### 1.3.1 - 1.3.3
- Upload to worlds/worldname/decks instead of Data/Decks/ to better package images with worlds
- Forge Asset Directory compatibility

###################### 1.3.4
- Alt draw bug for players from 1.3 release (Fixed in 1.3.4 by Norc)

###################### 1.4
- Use checkboxes on deal dialog (DONE)
- Player drop card as Token with HUD (No way to configure orphan token permissions, leaving as Tiles)
- Give Card to Player Tile HUD (DONE)
- Take Card From Player (DONE)
- Create a Button To Browse Decks and do things to them so you don't need to interact with a tile (DONE)
- Chat messages when using the Deck Form (DONE)
- Delete Button in card Context Menu (DONE)

#####################
- Deck based settings (deckSettings flag)
- Discard to bottom of Deck
- Default card back for decks
- save decks as _decks instead of Decks/ (maybe do a migration?)
- Settings for what decks a player can interact with
- Cards Placeables Layer
- Updated Video
