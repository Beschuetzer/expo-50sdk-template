## MVP
-add setStoresListSortType reducer and change how ListSorter works

-turn all lists into type into { [key in SortType]: T[] } & { currentSortType: SortType }
    --will need to change how reducers work
        ---the add reducer will need to use the arrays in SortType.None and currentSortType key to get the current lists and then create a new object after adding to the current lists (the currentSortType one will need to be sorted again but should be minimally challenging since using the already sorted list with the new item as a starting point)  
        --the remove item reducer will have to do something similar as the add reducer expect the currentSortType key array will not need to be sorted again. (all other sort type keys besides currentSortType and SortType.None will need to be removed)
        --will need to add a reducer called addSorted...List for each POS to be able to update currentSortType and have it update the key in the object with the sorted array

-convert ShoppingList to use Flashlist
-turn Itemslist type into { list: Item[], sortType: SortType }
-turn ShoppingList type into { list: ItemWithStoreSpecificValues[], sortType: SortType }

-Figure out how to style the shopping list tile
-figure out how to handle in cart vs in shopping list
-add sorting for items list
-add sorting for shopping list

-if sorting with 500+ items is slow, may need to rethink data structure for lists (make array and save the sort type (would need to add .None as an option too))



-Store details should have a way to view all of the isles and sort them in order
-Need to figure out how to drag and drop rows for easier custom sorting

-add filter for StoresList (make generic for use with other lists?)
-add StoresList (similar to Items list) with ability to remove stores and edit them (add to StoreScreen)

-Shopping list conversion:
    --add a new component that handles the ItemFormStoreSpecificFields
    --create components for each optional/store-specific field which shows a button "Add Frequency" then renders the component when pressed
    --update how addItemsListItem reducer works to add the specific store fields if a "currentStore" is given (needs to check and update dict values for those fields)
    -- figure out why stores are not being persisted


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