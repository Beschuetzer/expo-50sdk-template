## Work on Next
-what if there were no ShoppingListItem but instead the fields where the values differ are objects where keys are the name of the store and the value is the value for that store?

//todo: figure out how to handle pressing item in itemslist (add a new modal or use the current?)
add price field to ShoppingListItem
//todo: figure out types for useRouter/useNavigation (expo-router)
//todo: npx expo install react-native-safe-area-context (install and start using SafeAreaView) https://docs.expo.dev/versions/latest/sdk/safe-area-context/
//todo: fix bug where editing an item with upc then one without doesn't set the upc to blank
-UpcDetails rendering:
    --use PagerView to render the thumbnails 
    --figure out adding own image button
    --The user will be presented will two different set of options depending on whether  item is already in the itemsList (add to items list if not otherwise the ability to modify the item and add it to the shopping list) .
    --it should be a form with a save and clear button
    --any data from the API will pre-populate the fields
    --use a default thumbnail with the option to press a button to select the another if desired
    --the fields will be the fields in the type Item
-add store creation form and screen (maybe even a tab?)
-create a component that sets the current store POS (create POS in generalSlice)

-Add 'Add to Shopping List" button in 
-figure out how to save thumbnails to android storage for caching purposes
-add options tab (move mock buttons there, add auto save checkbox, add a backup button which can email a .json file of the current lists in redux, add a load button to load the .json file)
-reomove handleMockResponse in useUpcData when done and enable the actual fetch

## Features
-ability to add a "frequency" field which guesses the time before expected next purchase date for each item.  When pulling up a store, the date each item was last in the basket is used to provide recommendaitons for what may be needed this trip (add ability to sort on the date items were last in basket)
-ability to remove all items
-gps detection of store you're at when opening the app
-route memorization feature which shows the sequence of items and their pics after X seconds (i.e. flashcards)
the ability to create a store layout and have a map/route be generated based on the items in the cart (and where they are in the store).
-have the ability to share/post created store layouts
-ability to start a "shopping run" and have it track where you are in the run and provide images of the current item and accept input to change to the next item (or go back)
-voice commands like adding an item to the list