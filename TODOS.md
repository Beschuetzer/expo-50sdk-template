## MVP

-make updateStoreSpecificValues to a callback that passes in current value to get the new value
-figure out how to add buttons for sort and filter in header of item screen

-add addDate field to Item
-add by date sorter


-use StoresList approach to rework the other lists (using array and all the reducers/selectors around it):
   --itemsList (need to figure out sorting stuff)
   --lastPurchasedList?

-convert ShoppingList to use Flashlist
-Figure out how to style the shopping list tile
-figure out how to handle in cart vs in shopping list
-figure out how to auto-select store if the difference in current location is <= 1 mile?
-figure out how to handl lastPurchasedList

-if sorting with 500+ items is slow, may need to rethink data structure for lists (make array and save the sort type (would need to add .None as an option too))



-Store details should have a way to view all of the isles and sort them in order
-Need to figure out how to drag and drop rows for easier custom sorting

-add filter for all lists (make generic for use with other lists?)

 //todo: calculate FlashList estimatedItemSize for each instance

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

## Optimization Idea
-Create a buton to add 500 or so items to itemsList.  Then try updating the quantity for a few items and see how quickly things render.  If there is slugglishness, separate storeSpecificValues from itemList.  It Would be a dictionary with Key as the key.  Would need to make a selector called itemWithStoreSpecificValuesSelector.  Would need to update the Item type wherever it is being used.  Same for current ItemWithStoreSpecificValues type use cases.  Would need to updat addItemsListItem and updateStoreSpecificValues reducers