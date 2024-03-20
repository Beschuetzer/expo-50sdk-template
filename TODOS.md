## MVP
-Add confirmation modal for action like clear shopping list
-fix issue where using scanner to pull up existing item with custom image doesn't load custom image on load 

-add gorhom bottom sheet called RecommendationItemsSheet.tsx:
    --sheet will show up only on the shopping tab
    --minimized state will be only show "Show Recommended Items"
    --maximized state will show the RecommendedItemsList
    --convert RecommendedItemsList to use local state instead of redux for sort and filtering (remove the selector and the POS related to selected items and isSelectionMode)

-add different viewing modes for tiles (compact (hide images), image-only, etc.)
-figure out which action to turn on in items and shopping list when multiple items are selected (add reducers that leverage the functionality of the current reducer if it exists [create separate function])

ShoppingList
    --add the ability to change upc for an item and have it update rather than add a new item

-Custom thumbnail images:
    --add ability to long press an image which enters delete mode (trash bin show up in headerRight)

-Store details should have a way to view all of the isles and sort them in order

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

## Enhancements
-Holding an item in a list should enter multi-selction mode, which allows selecting multiple items and then performing some action
-Need to figure out how to drag and drop rows for easier custom sorting?


## Testing
-add a button to populate stores which creates 200 stores (x number of them being within .1 miles from current location);  then measure how long it takes to find the closest store in AutoSetStoreModal's useEffect

## Optimization Idea
-Create a buton to add 500 or so items to itemsList.  Then try updating the quantity for a few items and see how quickly things render.  If there is slugglishness, separate storeSpecificValues from itemList.  It Would be a dictionary with Key as the key.  Would need to make a selector called itemWithStoreSpecificValuesSelector.  Would need to update the Item type wherever it is being used.  Same for current ItemWithStoreSpecificValues type use cases.  Would need to updat addItemsListItem and updateStoreSpecificValues reducers

## Bugs
