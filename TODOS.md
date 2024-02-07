## Work on Next
//todo: finish replacing setLastUpcScanned calls to navigation.navigate(upcModal, {upc})
//todo: figure out types for useRoute (react-navigation)
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
-for the scanner screen, add a checkbox to enter "Add to Shopping List mode", where scanning checks for the item in the itemsList and add it if found, otherwise it grabs fetchs the upc data and adds it automatically; the default mode is to just populate the form?;  add an option to change default behavior (e.g. "Auto-save new Upcs scanned")?
-create ImagePicker, which displays the images in a row and allows you to select one (acheive this by passing in a setPickedImage useState setter where it is being used)
-figure out how to save thumbnails to android storage for caching purposes
-add lib react native picker
-fix bug with Thumbnail Picker where selecting ?
-use react-native-swipe-list-view to render items in the list (option to delete from list)
-use swipe list view to add items to grocery list from items not in the list (left to delete, right to add to grocery list)?
-figure out how to override the default back behavior when the UpcDetailsModal is open
-add options drawer (auto save and a backup button which can email a .json file of the items added)
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