## MVP
-Differentiate between stores in store specific values (add zip code or city)
-Add option to move an item from one shopping cart to another store's shopping cart (add a button on each item in the shopping cart next to the - and + buttons and an option in the menu which can handle multiple)
-Add menu in store details with a selection to copy store values from another store (add tests for this too)
-Move all of the menu items in the Items tab to a search bar and icons
-Selecting closest store on load not working?
-Add a search bar in the previously purchased tab
-fix issue using quick add then exiting the app doesn't save added items.  Moving one to in cart first does though

-Make aisle number field accept letters (check the sorting)
    --need to add a new screen called RouteCreator which allows the user to drag and drop (arrange) all of the aisle numbers that have been given for a specific store and give a name to a route. (add link in store form).  This route will be saved in the db and can be selected in the shopping screen (index.tsx).  The route will then be used in the getSorter helper by getting the index for each of the aisle numbers being sorted.  Return 1 if the current item index in this new array is greater than the next item index.  Return -1 if the next item index is greater otherwise return 0.
    --figure out why items with no aisle are not being sorted at the front or the end but in the middle somewhere


-Add "move list to..." option on shopping tab when items are in the shopping list:
    --modify the StoreManager to be a pure component and have the dispatch action called in the callback
-Add "move list from..." option on shopping tab
    --modify the StoreManager to be a pure component and have the dispatch action called in the callback
-Add a flow where you can add a store from the ItemForm (via a bottomsheet modal using the store forn?)
    --modify the StoreManager to have the option to select new store which opens the bottom sheet modal
-Investigate how to have ok google open the app and do something like "add item to list"


-add option to load data from db on app start (call it auto-sync on load).
-When scanning an item and adding to list, copy over the store specific values if only ever purchased at one store.  If multiple locations, add a prompt to select the store?
-Change how CopyValueModal works in ItemFormStoreSpecificValues (a message should be displayed when the list of items is empty)

-move all types to their own file to try and fix the warning about cyclical imports
-troubleshoot startup performance issue where ImageRenderer appears to be loading every item on load (change to lazy loading for items tab and any others it makes sense for?)
-use native-base components for:
    --modals (use Modal)
    --pickers (use Select)
    --can ActionSheet be leveraged anywhere? (https://docs.nativebase.io/action-sheet)

-add toggle for isDeveloperMode

- add options
    --(maybe?): add an option which removes all the store data in storeSpecificValues when deleting a store via DELETE /store

-add button for each store with an address call "Navigate" which opens the direction in the map app for the device 
    --https://stackoverflow.com/questions/43214062/open-maps-google-maps-in-react-native
-instead of current/set current label for store, use background color like in ItemTile
-now that each item has it's own _id, add an option to merge different items (in the case where a user mistakenly adds the same upc or name to an item)?
-move the store specific values to be higher up in the form?
-Move the store selection stuff to a menu option in the ItemModal?

-go through each BffService method and create request types in the types file for services/types.ts

-Add component called FormInput which has a title, input, and the spacing Stack (use in forms [e.g. ItemForm, ItemFormStoreSpecificItems, AccountScreen, etc.])
Check forms and other components for cases where a component is being reset via a useffect hook.  If the state is being reset when a prop changes, the key field can be used to reset the component

-add a way to copy a store
    --a button which copies the store specific values but uses the name/address/gps/etc on the StoreForm.
    --there would need to be a way to keep the values in sync (need new POS which tracks copies and then runs once every time the app starts or just checks the new POS to also make changes for any "copies") 

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
-AlphabeticalScroll:
    --add ability to scroll along the container and then navigate to section on release?
    --add tracking of current scroll amount (pass in the value from the list if desired)
-work on dark/light mode stuff?
-Make the ImageCapturer a sticky item in the QuickAddModal (harder than it appears)

## Testing
-add a button to populate stores which creates 200 stores (x number of them being within .1 miles from current location);  then measure how long it takes to find the closest store in AutoSetStoreModal's useEffect

## Optimization Idea
-Create a buton to add 500 or so items to itemsList.  Then try updating the quantity for a few items and see how quickly things render.  If there is slugglishness, separate storeSpecificValues from itemList.  It Would be a dictionary with Key as the key.  Would need to make a selector called itemWithStoreSpecificValuesSelector.  Would need to update the Item type wherever it is being used.  Same for current ItemWithStoreSpecificValues type use cases.  Would need to updat addItemsListItem and updateStoreSpecificValues reducers

## Bugs
-ItemForm: figure out issue where autosave happens on component mount when auto save is enabled
-ItemModal: fix issue with useUpcProduct being called whenever an item is opened and autoSave is enabled
-fix bug where deleting a new item with just a name that has been added via the shopping list tab causes a crash?
-StoreForm: when editing an existing item, it is not possible to set the state back to None (Select a State) when saving