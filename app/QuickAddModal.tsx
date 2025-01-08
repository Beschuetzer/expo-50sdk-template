import { FontAwesome } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { Button, FlatList, Row, Stack, theme } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import { FontAwesomeButton } from '@/components/FontAwesomeButton';
import { ImageCapturer } from '@/components/ImageCapturer';
import { QuickAddRow } from '@/components/QuickAddRow';
import { ListHeaderRight } from '@/components/header/ListHeaderRight';
import { useMenu } from '@/components/hooks/useMenu';
import { ListItemSeparator } from '@/components/lists/ListItemSeparator';
import { SwipeableRow } from '@/components/lists/SwipeableRow';
import { QuickAddRowModal } from '@/components/modals/QuickAddRowModal';
import {
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  QUANTITY_ROW_DEFAULT,
} from '@/constants/general';
import {
  currentStoreSelector,
  itemsListSelector,
  storeSpecificValuesMapSelector,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import {
  addToQuickAddList,
  clearQuickAddList,
  deleteQuickAddListItem,
  QUICK_ADD_UNIT_INITIAL,
  quickAddListWithGuessesSelector,
  quickAddModeSelector,
  toggleQuickAddMode,
} from '@/state/slices/quickAddSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { convertImageToList, saveItem } from '@/state/thunks';
import { StoreSpecificValueKey } from '@/types/Item';
import {
  ProcessedGroceryList,
  ProcessedGroceryListItem,
} from '@/types/bffService';
import { ArrayElement } from '@/types/helpers';
import {
  ProcessedGroceryListWithGuesses,
  QuickAddNewItems,
  SelectedItemIdsAndQuantities,
} from '@/types/quickAdd';
import { getKeyToUse } from '@/utils/helpers';

const IMAGE_QUALITY_TO_USE = 1;

function getInitialItemIdsAndQuantities(
  quickAddListWithGuesses: ProcessedGroceryListWithGuesses,
) {
  const toReturn = {} as SelectedItemIdsAndQuantities;
  for (const item of quickAddListWithGuesses.items) {
    const [parsedName, parsedQuantity] = item;
    const firstGuessItem =
      quickAddListWithGuesses.guesses?.[parsedName]?.[0]?.[0];
    toReturn[parsedName] = {
      quantity: parsedQuantity || QUANTITY_ROW_DEFAULT,
      id: firstGuessItem?._id || EMPTY_STRING,
    };
  }

  return toReturn;
}

export default function QuickAddModal() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const storeSpecificValuesMap = useAppSelector(storeSpecificValuesMapSelector);
  const itemsList = useAppSelector(itemsListSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const quickAddListWithGuesses = useAppSelector(
    quickAddListWithGuessesSelector,
  );
  const quickAddMode = useAppSelector(quickAddModeSelector);
  const isSaveDisabled = useMemo(
    () => quickAddListWithGuesses.items.length === 0,
    [quickAddListWithGuesses],
  );
  const newItemsRef = useRef<QuickAddNewItems>({});
  const selectedIndexesRef = useRef<{ [key: string]: number }>({});
  const selectedItemIdsAndQuantitiesRef = useRef<SelectedItemIdsAndQuantities>(
    {},
  );
  const [isAddNewRowModalVisible, setIsAddNewRowModalVisible] = useState(false);

  const [, closeMenu] = useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          options={[
            {
              text: `Toggle Mode`,
              onPress: onToggleMode,
            },
          ]}
        />
      ),
      title: `Quick Add (${quickAddMode})`,
    }),
  });

  const onClearPress = useCallback(() => {
    dispatch(clearQuickAddList());
  }, []);

  const onDeleteItem = useCallback(
    (index: number, item: ArrayElement<ProcessedGroceryList['items']>) => {
      delete newItemsRef?.current[item?.[0]];
      delete selectedItemIdsAndQuantitiesRef?.current[item?.[0]];
      dispatch(deleteQuickAddListItem(index));
    },
    [selectedItemIdsAndQuantitiesRef.current, newItemsRef.current],
  );

  const onImageChange = useCallback(async (image: ImagePickerAsset) => {
    await dispatch(convertImageToList(image.base64 || EMPTY_STRING));
  }, []);

  const onSavePress = useCallback(async () => {
    try {
      const entries = Object.entries(
        selectedItemIdsAndQuantitiesRef.current || {},
      );
      const newItemPayloads = Object.entries(newItemsRef.current || {});

      if (entries.length === 0 && newItemPayloads.length === 0) return;
      for (const [parsedName, { quantity, id }] of entries) {
        if (!id) continue;
        console.log(`updating quantity for ${parsedName} to ${quantity}`);
        dispatch(
          updateStoreSpecificValues({
            key: { _id: id, name: EMPTY_STRING },
            storeSpecificValuesToUpdate: {
              quantity: (current) => current + quantity,
            },
          }),
        );
      }

      if (newItemPayloads.length > 0) {
        console.log('processing newItems');
        const actions = [];
        for (const [parsedName, payload] of newItemPayloads) {
          if (!payload) continue;
          console.log(
            `adding new item for ${parsedName} as '${payload.item.name}' with quantity: ${payload.storeSpecificValues?.[StoreSpecificValueKey.Quantity]?.[currentStore._id]}`,
          );
          actions.push(saveItem(payload));
        }
        const start = performance.now();
        await Promise.all(actions.map((action) => dispatch(action)));
        const end = performance.now();
        console.log(`Time to complete: ${end - start}`);
      }

      navigation.canGoBack() && navigation.goBack();
      onClearPress();
    } catch (error) {
      console.log({ errorHere: error });
    }
  }, [newItemsRef, selectedItemIdsAndQuantitiesRef, navigation]);

  const onToggleMode = useCallback(() => {
    dispatch(toggleQuickAddMode());
  }, []);

  useEffect(() => {
    selectedItemIdsAndQuantitiesRef.current = getInitialItemIdsAndQuantities(
      quickAddListWithGuesses,
    );
  }, [quickAddListWithGuesses]);

  return (
    <AbsolutePositionedScreen
      useFlatList
      flatListProps={{
        m: 0,
      }}
      absolutelyPositionedJsx={
        <Row
          justifyContent="space-between"
          alignItems="center"
          space={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          <Button flex={1} onPress={onSavePress} isDisabled={isSaveDisabled}>
            Save
          </Button>
          <Button
            flex={1}
            onPress={onClearPress}
            isDisabled={quickAddListWithGuesses?.items?.length === 0}
          >
            Clear
          </Button>
        </Row>
      }
    >
      <Stack py={theme.space[FORM_INTER_ITEM_SPACING]}>
        <Row
          px={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          justifyContent="space-between"
          alignItems="center"
        >
          <ImageCapturer
            imageOptions={{
              quality: IMAGE_QUALITY_TO_USE,
              base64: true,
              allowsEditing: false,
            }}
            onImageChange={onImageChange}
          />
          <FontAwesomeButton
            name="plus"
            onPress={() => setIsAddNewRowModalVisible(true)}
          />
        </Row>
        <FlatList
          data={quickAddListWithGuesses.items}
          ItemSeparatorComponent={() => <ListItemSeparator />}
          keyExtractor={(item) => item?.[0] || EMPTY_STRING}
          renderItem={(itemLocal) => {
            const { index, item } = itemLocal;
            return (
              <SwipeableRow
                key={index}
                swipeableProps={{
                  onBegan: closeMenu,
                }}
                leftSwipe={{
                  title: (
                    <Stack paddingRight={theme.space[2]} alignItems="center">
                      <FontAwesome
                        name="trash"
                        color={theme.colors.white}
                        size={4}
                      />
                    </Stack>
                  ),
                  backgroundColor: theme.colors.red[900],
                  onPress: onDeleteItem.bind(null, index, item),
                }}
              >
                <QuickAddRow
                  key={index}
                  currentStore={currentStore}
                  item={item}
                  index={index}
                  itemsList={itemsList}
                  storeSpecificValuesMap={storeSpecificValuesMap}
                  newItemInitial={newItemsRef?.current[item[0]]}
                  previouslySelectedIndex={
                    selectedIndexesRef.current?.[item?.[0]]
                  }
                  guesses={quickAddListWithGuesses.guesses?.[item[0]]}
                  onAddNewItem={(parsedName, newItemPayload) => {
                    if (!parsedName || !newItemPayload) return;
                    newItemsRef.current[parsedName] = newItemPayload;
                    delete selectedItemIdsAndQuantitiesRef.current[parsedName];
                  }}
                  onQuantityChange={(parsedName, quantity) => {
                    if (!parsedName) return;
                    selectedItemIdsAndQuantitiesRef.current = {
                      ...selectedItemIdsAndQuantitiesRef.current,
                      [parsedName]: {
                        ...selectedItemIdsAndQuantitiesRef.current[parsedName],
                        quantity,
                      },
                    };
                    if (
                      newItemsRef.current[parsedName]?.storeSpecificValues?.[
                        StoreSpecificValueKey.Quantity
                      ]
                    ) {
                      newItemsRef.current[parsedName].storeSpecificValues[
                        StoreSpecificValueKey.Quantity
                      ][currentStore._id] = quantity;
                    }
                  }}
                  onSearchModalSelect={(parsedName, item) => {
                    if (!parsedName) return;
                    if (item) {
                      selectedItemIdsAndQuantitiesRef.current = {
                        ...selectedItemIdsAndQuantitiesRef.current,
                        [parsedName]: {
                          ...selectedItemIdsAndQuantitiesRef.current[
                            parsedName
                          ],
                          id: getKeyToUse(item),
                        },
                      };
                    }
                  }}
                  onSelectItem={(parsedName, selectedIndex, item) => {
                    if (!parsedName) return;
                    selectedIndexesRef.current = {
                      ...selectedIndexesRef.current,
                      [parsedName]: selectedIndex,
                    };
                    if (item) {
                      selectedItemIdsAndQuantitiesRef.current = {
                        ...selectedItemIdsAndQuantitiesRef.current,
                        [parsedName]: {
                          ...selectedItemIdsAndQuantitiesRef.current[
                            parsedName
                          ],
                          id: getKeyToUse(item),
                        },
                      };
                    }
                  }}
                />
              </SwipeableRow>
            );
          }}
        />
        <QuickAddRowModal
          title="Add New Row"
          isVisible={isAddNewRowModalVisible}
          onCancel={() => setIsAddNewRowModalVisible(false)}
          onConfirm={(name: string, quantity: number) => {
            setIsAddNewRowModalVisible(false);
            const itemToUse = [
              name,
              quantity,
              QUICK_ADD_UNIT_INITIAL,
            ] as ProcessedGroceryListItem;
            dispatch(
              addToQuickAddList({
                items: [itemToUse],
              }),
            );
          }}
        />
      </Stack>
    </AbsolutePositionedScreen>
  );
}
