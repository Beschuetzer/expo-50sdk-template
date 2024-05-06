## MVP
-add options to auto-save items:
    -ItemForm
        -figure out issue where autosave happens when auto save is enabled and a new item is opened
        -fix issue where each scanned item is automatically added when auto save is true?
    -test thoroughly with auto-save on/off

-add ErrorBoundary lib
-add free mongodb or sql server integration into bff to be able to save things 
-add a way to copy a store
    --a button which copies the store specific values but uses the name/address/gps/etc on the StoreForm.
    --there would need to be a way to keep the values in sync (need new POS which tracks copies and then runs once every time the app starts or just checks the new POS to also make changes for any "copies") 

-create a basic backend for grocify and see if heroku can host it on current plan
-add a button/menu option in shopping tab to for "shopping mode", which opens a drawer that scans barcodes and then moves that barcode (if found in shopping list to in cart list).
    --navigates to a new page which has has the next three items displayed with full details and eventually a text to speech reading of the item

-Custom thumbnail images:
    --add ability to long press an image which enters delete mode (trash bin show up in headerRight)

-Store details should have a way to view all of the isles and sort them in order

//todo: figure out types for useRouter/useNavigation (expo-router)
//todo: fix bug where editing an item with upc then one without doesn't set the upc to blank

-add jest tests to helpers and other testable items (may need to refactor a bit)
-test everything out on a device with notches and see if SafeView is needed anywhere

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
-ability to get the current temp at a specified home location (address which is converted to GPS coordinates) and then adding a field for each item whether it is freezer or fridge item.  Then using the temp to determine how long the item can stay outside before going bad?


## Enhancements
-Holding an item in a list should enter multi-selction mode, which allows selecting multiple items and then performing some action
-Need to figure out how to drag and drop rows for easier custom sorting?


## Testing
-add a button to populate stores which creates 200 stores (x number of them being within .1 miles from current location);  then measure how long it takes to find the closest store in AutoSetStoreModal's useEffect

## Optimization Idea
-Create a buton to add 500 or so items to itemsList.  Then try updating the quantity for a few items and see how quickly things render.  If there is slugglishness, separate storeSpecificValues from itemList.  It Would be a dictionary with Key as the key.  Would need to make a selector called itemWithStoreSpecificValuesSelector.  Would need to update the Item type wherever it is being used.  Same for current ItemWithStoreSpecificValues type use cases.  Would need to updat addItemsListItem and updateStoreSpecificValues reducers

## Bugs
