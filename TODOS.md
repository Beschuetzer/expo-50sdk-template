## MVP
-bug in addItemsLIstItem (add item then toggle to costco store and add a store-specific value, then save.  Go back and the target values are gone)
-finish ItemsList left swipe callback
-start ShoppingList (can remove storesList related stuff from listSlice?)


-Store details should have a way to view all of the isles and sort them in order
-Need to figure out how to drag and drop rows for easier custom sorting

-add filter for StoresList (make generic for use with other lists?)
-add StoresList (similar to Items list) with ability to remove stores and edit them (add to StoreScreen)

-Shopping list conversion:
    --add a new component that handles the ItemFormStoreSpecificFields
    --create components for each optional/store-specific field which shows a button "Add Frequency" then renders the component when pressed
    --update how addItemsListItem reducer works to add the specific store fields if a "currentStore" is given (needs to check and update dict values for those fields)
    -- figure out why stores are not being persisted
    --


//todo: figure out types for useRouter/useNavigation (expo-router)
//todo: npx expo install react-native-safe-area-context (install and start using SafeAreaView) https://docs.expo.dev/versions/latest/sdk/safe-area-context/
//todo: fix bug where editing an item with upc then one without doesn't set the upc to blank
-UpcDetails rendering:
    --use PagerView to render the thumbnails 
    --The user will be presented will two different set of options depending on whether  item is already in the itemsList (add to items list if not otherwise the ability to modify the item and add it to the shopping list) .
    --it should be a form with a save and clear button
    --any data from the API will pre-populate the fields
    --use a default thumbnail with the option to press a button to select the another if desired
    --the fields will be the fields in the type Item
-add store creation form and screen (maybe even a tab?)
-create a component that sets the current store POS (create POS in generalSlice)

-Swiping to add to shopping list should not be an option unless a store is selected (or a message should display indicating a store is needed (add an AlertModal for this?))
-Swiping to add to shopping list should add one of that item for the current store 
-add options tab (move mock buttons there when done, add auto save checkbox, add a backup button which can email a .json file of the current lists in redux, add a load button to load the .json file)
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
-add ability to open google maps for directions to a store (would need to allow input of address or ability to get from GPS coords)