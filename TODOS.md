## Small Picture
-setup call to https://world.openfoodfacts.org/api/v0/product/072273487253 and display results in gorham bottom sheet:
    --finish hook useUpcData
    --have scanning 
-create ImagePicker, which displays the images in a row and allows you to select one (acheive this by passing in a setPickedImage useState setter where it is being used)
-figure out how to save thumbnails to android storage for caching purposes
-add lib react native picker
-use react-native-swipe-list-view to render items in the list (option to delete from list)
-use swipe list view to add items to grocery list from items not in the list (left to delete, right to add to grocery list)?
-add options drawer (auto save and a backup button which can email a .json file of the items added)

## Big Picture
-ability to add a "frequency" field which guesses the time before expected next purchase date for each item.  When pulling up a store, the date each item was last in the basket is used to provide recommendaitons for what may be needed this trip (add ability to sort on the date items were last in basket)
-ability to remove all items
-gps detection of store you're at when opening the app
-route memorization feature which shows the sequence of items and their pics after X seconds (i.e. flashcards)
the ability to create a store layout and have a map/route be generated based on the items in the cart (and where they are in the store).
-have the ability to share/post created store layouts
-ability to start a "shopping run" and have it track where you are in the run and provide images of the current item and accept input to change to the next item (or go back)
-voice commands like adding an item to the list