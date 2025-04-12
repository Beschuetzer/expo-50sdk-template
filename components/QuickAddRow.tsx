import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Picker } from '@react-native-picker/picker';
import _ from 'lodash';
import { Heading, Input, Row, useTheme, Stack, Text } from 'native-base';
import { IInputProps } from 'native-base/lib/typescript/components/primitives/Input/types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dimensions } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';

import { BottomSheetModalWithFixedHeader } from './BottomSheetModalWithFixedHeader';
import { FontAwesomeButton } from './FontAwesomeButton';
import { ImageRenderer } from './ImageRenderer';
import { ItemForm } from './forms/ItemForm';
import {
  ItemSearchModal,
  ItemSearchModalSelectedItem,
} from './modals/ItemSearchModal';
import { ModalWithBlur } from './modals/ModalWithBlur';
import { ItemTileCopyModal } from './tiles/ItemTileCopyModal';

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  QUANTITY_ROW_DEFAULT,
} from '@/constants/general';
import { setError } from '@/state/slices/generalSlice';
import { useAppDispatch } from '@/state/store';
import { Item, StoreSpecificValueKey } from '@/types/Item';
import { ItemFormOnSave } from '@/types/itemForm';
import { QuickAddRowProps } from '@/types/quickAdd';
import { getItemValidation, getKeyToUse } from '@/utils/helpers';
import { logWhenDevelopmentMode } from '@/utils/logging';

const DEFAULT_QUANTITY = 1;
export function QuickAddRow(props: QuickAddRowProps) {
  const theme = useTheme();
  const {
    currentStore,
    item,
    itemsList,
    guesses,
    index,
    newItemInitial,
    previouslySelectedIndex,
    storeSpecificValuesMap,
    onAddNewItem,
    onQuantityChange,
    onSearchModalSelect,
    onSearchPress,
    onSelectItem,
  } = props;
  const dispatch = useAppDispatch();
  const [parsedName, parsedQuantity, parsedUnit] = item;
  const [itemToSearch, setItemToSearch] = useState<
    QuickAddRowProps['item'] | null
  >(null);
  const [searchedItem, setSearchedItem] =
    useState<ItemSearchModalSelectedItem<Item>>(null);
  const [cursorPosition, setCursorPosition] = useState<
    IInputProps['selection']
  >({
    start: 0,
    end: 0,
  });
  const delayedOnAddNewItemCallTimeoutRef = useRef<any>();
  const itemFormSheetRef = useRef<BottomSheetModalMethods>(null);
  const pickerRef = useRef<Picker<any>>(null);
  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);
  const [quantityToUse, setQuantityToUse] = useState(
    parsedQuantity || DEFAULT_QUANTITY,
  );
  const [selectedIndex, setSelectedIndex] = useState(
    previouslySelectedIndex || EMPTY_NUMBER,
  );
  const [newItemPayload, setNewItemPayload] = useState<
    ItemFormOnSave | undefined
  >(newItemInitial || undefined);
  const newItemValidation = useMemo(
    () => getItemValidation(newItemPayload?.item),
    [newItemPayload?.item],
  );
  const newItem = useMemo(() => {
    const payloadQuantity =
      newItemPayload?.storeSpecificValues?.quantity?.[currentStore._id];
    return newItemPayload?.item
      ? {
          ...newItemPayload?.item,
          ...newItemPayload?.storeSpecificValues,
          images: newItemPayload?.item?.images?.filter(Boolean) || [],
          quantity: {
            [currentStore._id]:
              quantityToUse || payloadQuantity || QUANTITY_ROW_DEFAULT,
          },
        }
      : undefined;
  }, [newItemPayload, quantityToUse]);

  const fontAwesomeButtonStyle = useMemo(
    () => ({
      borderRadius: theme.sizes[2],
      backgroundColor: theme.colors.primary[100],
      paddingVertical: 15,
      paddingHorizontal: 15,
    }),
    [theme],
  );

  const fontAwesomeButtonInnerStyle = useMemo(
    () => ({
      color: theme.colors.primary[900],
      size: theme.sizes[4],
    }),
    [theme],
  );

  const pickerItems = useMemo(() => {
    const toReturn = [...guesses];
    if (searchedItem) toReturn.push([searchedItem, 0]);
    if (newItemValidation.isValid && newItem) {
      toReturn.push([newItem, 0]);
    }
    //todo: remove this when done testing
    if (parsedName === 'Belinis') {
      logWhenDevelopmentMode({
        guesses,
        searchedItem,
        newItem,
      });
    }
    return toReturn;
  }, [guesses, searchedItem, newItemPayload?.item]) as [Item, number][];

  const selectedItem = useMemo(
    () => pickerItems?.[selectedIndex]?.[0],
    [pickerItems, selectedIndex],
  );

  const onItemFormSave = useCallback(
    (onSavePayload: ItemFormOnSave) => {
      if (!onSavePayload) return;
      const common = {
        _id: EMPTY_STRING,
        addedDate: EMPTY_NUMBER,
        lastUpdatedDate: EMPTY_NUMBER,
      } as Partial<Item>;
      const item1 = {
        ...onSavePayload.item,
        ...onSavePayload.storeSpecificValues,
        ...common,
      } as Item;
      const item2 = {
        ...newItemPayload?.item,
        ...newItemPayload?.storeSpecificValues,
        ...common,
      } as Item;
      const itemsAreEqual = _.isEqual(item1, item2);
      if (itemsAreEqual) return;
      setNewItemPayload(onSavePayload);
    },
    [newItemPayload],
  );

  const updateCursorPosition = useCallback((quantity: number) => {
    const cursorPositionToUse = String(quantity).length;
    setCursorPosition({
      start: cursorPositionToUse,
      end: cursorPositionToUse,
    });
  }, []);

  const onBlurNumberInput = useCallback(() => {
    if (quantityToUse <= 0) {
      setQuantityToUse(DEFAULT_QUANTITY);
    }
  }, [parsedQuantity, quantityToUse]);

  const onChangeNumber = useCallback(
    (newQuantity: string) => {
      const newParsedQuantity = parseInt(newQuantity || `${EMPTY_NUMBER}`, 10);
      const currentStoreQuantity =
        newItem?.[StoreSpecificValueKey.Quantity]?.[currentStore._id];

      setQuantityToUse(newParsedQuantity);
      if (newItem && currentStoreQuantity != null) {
        newItem[StoreSpecificValueKey.Quantity][currentStore._id] =
          newParsedQuantity;
      }
      onQuantityChange && onQuantityChange(parsedName, newParsedQuantity);
      updateCursorPosition(newParsedQuantity);
    },
    [updateCursorPosition, parsedName, newItem],
  );

  const onFocusNumberInput = useCallback(() => {
    updateCursorPosition(quantityToUse);
  }, [updateCursorPosition, quantityToUse]);

  const onItemPress = useCallback(() => {
    if (
      newItemPayload?.item &&
      getKeyToUse(newItemPayload.item) === getKeyToUse(selectedItem)
    ) {
      itemFormSheetRef.current?.present();
    } else {
      pickerRef.current?.focus();
    }
  }, [
    selectedItem,
    pickerItems,
    pickerRef.current,
    itemFormSheetRef.current,
    newItemPayload?.item,
  ]);

  const onPlusButtonPress = useCallback(() => {
    itemFormSheetRef.current?.present();
  }, [itemFormSheetRef.current]);

  const onSearchPressLocal = useCallback(() => {
    setItemToSearch(item);
    onSearchPress && onSearchPress(item);
  }, [onSearchPress, item]);

  const onSelectItemLocal = useCallback(
    (selectedIndex: number) => {
      const selectedItemLocal =
        pickerItems?.[selectedIndex]?.[0] || selectedItem;
      onSelectItem &&
        onSelectItem(parsedName, selectedIndex, selectedItemLocal);
      setSelectedIndex(selectedIndex);
    },
    [onSelectItem, parsedName, selectedItem],
  );

  /**
   *This is used to make sure that if the user presses save quickly after typing the name,
   *the most current value is used
   **/
  useEffect(() => {
    clearTimeout(delayedOnAddNewItemCallTimeoutRef.current);
    delayedOnAddNewItemCallTimeoutRef.current = setTimeout(() => {
      onAddNewItem && onAddNewItem(parsedName, newItemPayload);
    }, 0);
  }, [
    delayedOnAddNewItemCallTimeoutRef,
    newItemPayload,
    parsedName,
    onAddNewItem,
  ]);

  return (
    <>
      <Stack
        px={theme.space[FORM_INTER_ITEM_SPACING] * 2}
        py={theme.space[FORM_INTER_ITEM_SPACING]}
      >
        <Row
          justifyContent="space-between"
          alignItems="center"
          space={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          <Heading size="sm">
            {index + 1}
            ):&nbsp; "{parsedName}"
          </Heading>
          <Row>
            <TouchableOpacity
              onPress={() => {
                setIsQuantityModalVisible(true);
              }}
            >
              <Text color={theme.colors.blue[900]}>Quantity:&nbsp;</Text>
            </TouchableOpacity>
            <Text>{quantityToUse}</Text>
          </Row>
        </Row>
        <Row
          justifyContent={pickerItems.length > 0 ? 'space-between' : 'flex-end'}
          marginBottom={
            pickerItems.length > 0
              ? 0
              : theme.space[FORM_INTER_ITEM_SPACING] / 2
          }
          alignItems="center"
        >
          <RectButton
            onPress={onItemPress}
            style={{
              flex: 1,
              paddingHorizontal: theme.space[FORM_INTER_ITEM_SPACING],
            }}
          >
            <Row justifyContent="space-between" alignItems="center">
              <ImageRenderer
                item={selectedItem}
                height={46}
                width={(46 * 2) / 3}
              />
              {pickerItems.length > 0 ? (
                <Picker
                  ref={pickerRef}
                  style={{ flex: 1 }}
                  selectedValue={selectedIndex}
                  onValueChange={onSelectItemLocal}
                >
                  {pickerItems.map((guess, index) => (
                    <Picker.Item
                      key={index}
                      label={guess[0].name}
                      value={index}
                    />
                  ))}
                </Picker>
              ) : (
                <Row
                  flex={1}
                  justifyContent="flex-start"
                  alignItems="center"
                  pl={theme.space[FORM_INTER_ITEM_SPACING] * 2}
                >
                  <Heading size="sm" color={theme.colors.red[500]}>
                    No Item Found
                  </Heading>
                </Row>
              )}
            </Row>
          </RectButton>
          <FontAwesomeButton
            name="plus"
            fontAwesomeProps={fontAwesomeButtonInnerStyle}
            style={{
              ...fontAwesomeButtonStyle,
              marginRight: theme.space[FORM_INTER_ITEM_SPACING],
            }}
            onPress={onPlusButtonPress}
          />
          <FontAwesomeButton
            name="search"
            fontAwesomeProps={fontAwesomeButtonInnerStyle}
            onPress={onSearchPressLocal}
            style={fontAwesomeButtonStyle}
          />
        </Row>
      </Stack>
      <ItemSearchModal<Item>
        onGetTitle={(selectedItem) => {
          const itemName = itemToSearch?.[0] || EMPTY_STRING;
          if (itemName && selectedItem) {
            return `Replace '${itemName}' with '${selectedItem.name}'?`;
          }
          return `Replace '${itemName}'`;
        }}
        isVisible={!!itemToSearch}
        onConfirm={(selectedItem) => {
          setItemToSearch(null);
          if (selectedItem) {
            setSelectedIndex(guesses.length);
            setSearchedItem(selectedItem);
            onSearchModalSelect &&
              onSearchModalSelect(parsedName, selectedItem);
          } else {
            dispatch(
              setError({ message: 'No item was selected.  Try again.' }),
            );
          }
        }}
        onCancel={() => {
          setItemToSearch(null);
        }}
        onGetValuesList={(itemsList) => {
          const copy = [...itemsList];
          copy.sort((a, b) => {
            const nameA = a.name || EMPTY_STRING;
            const nameB = b.name || EMPTY_STRING;
            if (nameA === nameB) return 0;
            return nameA > nameB ? 1 : -1;
          });
          return copy;
        }}
        onGetFilteredValues={(items, filterValue) => {
          const isNumbersOnly = filterValue.match(/^\s*\d+\s*$/);
          const filteredValues = items.filter((item) => {
            const valueToMatch = isNumbersOnly
              ? item?.upc || EMPTY_STRING
              : item?.name || EMPTY_STRING;

            if (valueToMatch?.match(filterValue)) {
              return item;
            }
          });
          return filteredValues;
        }}
        onRenderChildren={(item) => {
          const { item: itemToRender } = item;
          const key = getKeyToUse(itemToRender);
          return (
            <ItemTileCopyModal
              itemKey={key}
              value={itemToRender.name || EMPTY_STRING}
            />
          );
        }}
      />
      <ModalWithBlur
        title={`Edit '${parsedName}'`}
        isVisible={isQuantityModalVisible}
        onConfirm={() => setIsQuantityModalVisible(false)}
        cancelButton={{
          isVisible: false,
        }}
        confirmButton={{
          text: 'Done',
        }}
        onBlurPress={() => setIsQuantityModalVisible(false)}
      >
        <Stack>
          <Row
            space={theme.sizes[FORM_INTER_ITEM_SPACING] * 2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading size="sm">Quantity:</Heading>
            <Input
              keyboardType="numeric"
              onChangeText={onChangeNumber}
              selection={cursorPosition}
              value={String(quantityToUse)}
              maxW={Dimensions.get('window').width * 0.25}
              onFocus={onFocusNumberInput}
              onBlur={onBlurNumberInput}
            />
            <FontAwesomeButton
              name="plus"
              onPress={() => setQuantityToUse((current) => current + 1)}
            />
            <FontAwesomeButton
              name="minus"
              onPress={() =>
                setQuantityToUse((current) => (current <= 1 ? 1 : current - 1))
              }
            />
          </Row>
        </Stack>
      </ModalWithBlur>
      <BottomSheetModalWithFixedHeader
        ref={itemFormSheetRef}
        title={`Add Item for '${parsedName}'`}
        onSubmit={() => {
          logWhenDevelopmentMode({
            newItem: newItemPayload?.item,
            images: newItemPayload?.item.images,
            price:
              newItemPayload?.storeSpecificValues?.[
                StoreSpecificValueKey.Price
              ],
            quantity:
              newItemPayload?.storeSpecificValues?.[
                StoreSpecificValueKey.Quantity
              ],
          });
          itemFormSheetRef.current?.close();
          const newQuantity =
            newItemPayload?.storeSpecificValues?.[
              StoreSpecificValueKey.Quantity
            ]?.[currentStore._id];

          setQuantityToUse(newQuantity || QUANTITY_ROW_DEFAULT);
        }}
        onClose={() => {
          if (newItemPayload) return;
          setTimeout(() => {
            setNewItemPayload(undefined);
          }, 0);
        }}
        submitButton={{
          validation: newItemValidation,
          isEnabled: newItemValidation.isValid,
          text: 'Save',
        }}
        closeButton={{
          text: 'Cancel',
        }}
        useFullscreen
      >
        <ItemForm
          hideStoreManagerRow
          showContentOnly
          shouldFocusFirstField
          autoSave
          autoSaveOverride
          initialQuantity={quantityToUse}
          autoSaveDebounce={0}
          onSave={onItemFormSave}
          storeSpecificValuesMap={storeSpecificValuesMap}
          items={itemsList.data}
          originalKey={{ name: EMPTY_STRING }}
          canOverrideItem={false}
          currentStore={currentStore}
          item={newItem}
        />
      </BottomSheetModalWithFixedHeader>
    </>
  );
}
