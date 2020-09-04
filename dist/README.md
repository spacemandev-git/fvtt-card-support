# Card Support for Foundry VTT

## Usage Instructions
1. Click the "SDF Import" Button in the Journal tab of the Sidebar (see gif).
2. Select a valid SDF zip file. Samples are located in "data/modules/cardsupport/samples" (more on SDF below)
3. Drag the deck's FOLDER to the canvas to use the Tile API to interact with it directly:
![Create New Deck Tile](https://media.giphy.com/media/dax0A0WNPhxlhfm36N/giphy.gif)
4. Macros, systems, and modules can also interact with decks through the Card API

Video (version 1.1.0): https://youtu.be/qmxG8AaufXA

## API
At a high level, this module abuses the setFlag() and getFlag() operators on folders and journal entries to store card objects. 

A FolderID refers to the DeckID, and the JournalEntry ID refers to the Card ID. 

### Hooks
Calls ```decks.ready``` hook when it's finished initalizing decks

### game.decks

```game.decks.get(deckId:string)```

Give it a ID String of the deck you want to fetch and it'll return the DECK Object (see DECK object below)

//Probably just use the SDF button instead of this method directly

```game.decks.create(deckfile:File)```

Give it a File Object that references a valid SDF zip file (see below). It will create a subfolder under "Decks", unzip the image files and build the deck object. 


### DECK Class
Where most of the functions you want are.

Stores three lists: allcards, deck, and discard.

```deck._state``` Returns the current state of the deck. Could be shuffled, missing cards that have been moved to discard, etc

```deck._cards``` Returns the list of cards as it was when it was originally created

```deck._discard``` Returns the discard list


```deck.drawCard()``` returns the top card on the deck and removes it from deck.deck

```deck.reset()``` resets the deck.deck to original state and empties the discard

```deck.discardCard(cardID:string)``` puts a card in the discard pile. The card must be part of it's original cards AND not in the current state

```deck.shuffle()``` Shuffles the current deck.deck 

```deck.infiniteDraw()``` Returns a random card without removing it from the state. 

```deck.getCardData(cardID)``` Returns the json object with the card data. 

``` deck.removeFromState(cardIDs)``` Takes in a list of cardIDs to remove from the state. DOES NOT PLACE THEM IN DISCARD. It sends the cards to /dev/null  

``` deck.removeFromDiscard(cardIDs)``` Takes in a list of cardIDs to remove from the discard. Effitively "burns" the cards

``` deck.addToDeckState(cardIDs) ``` TEMPORARILY adds certain cards to the state. These cards are LOST when the deck is reset. 

``` deck.addToDeckCards(cardIDs) ``` Permanently adds cards to the deck. These remain after a reset. Used for appending cards. 


```new Deck(folderId)```
Construstor builds a deck object from a folder full for Journal Entries


### SDF (Standard Deck Format)
See the sample folder for an example of this.

SDF Version: 0.6

#### Deck Structure
    deckfolder.zip/
      deck.yaml
      images/

#### deck.yaml
```
- (required) name: name of the card, does not need the full path as previous versions required
- (optional) sdfv: sdf version to be used by the interpreter. If left out, will use interpreter default
- (optional) img: path to file inside images. If the file is images/img.jpg then the path should just be img.jpg
- (optional) back: image path for the back of the card 
- (optional) data: object with data values for the card 
- (optional) qty: How many copies of the card exist in the deck

Split with `---' to denote different file for each card
```
Example:
```
name: 2C
sdfv: 0.6
img: 2C.png
back: blue_back.png
data:
  value: 2
  suit: Clubs
---
name: 3C
sdfv: 0.6
img: 3C.png
back: blue_back.png
data:
  value: 2
  suit: Clubs
```

#### Manually Prepping a SDF File
Create an images folder, a deck.yaml as defined above, and zip them up. You're done.

#### Using the provided scripts
Scripts are still being written, please hold.
