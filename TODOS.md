## MVP

- Return items:
    I want you to create a way to add return items to a shopping list for a store.  There should be a menu item called "Add Return Item", which when pressed opens a modal for selecting an item to return.  Return items appear similarly to regular items in the shopping list with two exceptions:
        1. They are always the first items in the list (at the top)
        2. They are styled differently so it is clear they are returns.
        
    pressing the "Clear Cart" button in the shopping list menu should remove all return items as well.
        
- I want you to create a new feature called route creation.  THe idea is that users can create routes for a store based on the locations in the store.  You will need to do the following to make this work properly:

    1. Create a new field on the Item type (store-specific value type) called "location" which is a string.  You will also need to create a "routes" field on the Store type with is an array of type Route (see below).  Users will need to be able to create new locations for a given store, so you will need a way to do that in the route creation screen.
    ```typescript

    // the idea is to create a "Route" or way to go through the store.
    type Route = {
        name: string // name of the route
        userId: string // person who created the route
        storeId: string // store to which the route 
        locations: string[] // the ordering here matters.  The location at index 0 is the first location in the route and the last location is the last location in the route.
    }
    
    
    ```
    2. Create a route creation screen that allows users to create locations for a store.  On this screen should be the name of the store as the screen's title.  Each location should be a box/item that can be dragged to adjust the order for the route.  The route then should be saved to either a new slice or an existing slice if it makes sense and will save the storeId, userId, and the locationIds
    3. The item form will need a way to display the new location field.
    4. The shopping list should have a menu item called "Start Route" added.  This will open a modal where users can select a route.  Once the route is selected and the "Start" button is pressed, the items in the shopping cart will be re-arranged based on their location in the selected route (items at the beginning of the route come before items after it).  The idea is that the user can more easily go through the store and find the items in the order that they appear on the route.

    old stuff:
        --need to add a new screen called RouteCreator which allows the user to drag and drop (arrange) all of the aisle numbers that have been given for a specific store and give a name to a route. (add link in store form).  This route will be saved in the db and can be selected in the shopping screen (index.tsx).  The route will then be used in the getSorter helper by getting the index for each of the aisle numbers being sorted.  Return 1 if the current item index in this new array is greater than the next item index.  Return -1 if the next item index is greater otherwise return 0.



-need a way to edit inventory locations?
-Add an inventory slice
    --add ability to send notifications around expiration dates
-add a field called associatedUpcs which would be used when:
    --finding items when a new upc is scanned (in the effort of hitting the upc service too much);
    --adding/removing inventory items when scanning a upc which doesn't exist as an item


-add an option to scan an item while in the shopping list and have it move it to the cart if it's is in the shopping list other show a toast saying it is not in the shopping list

-add a scroll bar like Music player app
-Move all of the menu items in the Items tab to a search bar and icons
-add ability to share items (add a list of permissions (e.g. read and write) which the server checks for doing anything; POST endpoints need write permission and GET needs either)

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
-route memorization feature which shows the sequence of items and their pics after X seconds (i.e. flashcards)
-the ability to create a store layout and have a map/route be generated based on the items in the cart (and where they are in the store).
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