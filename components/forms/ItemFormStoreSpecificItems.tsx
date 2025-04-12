import _ from 'lodash';
import { Stack, Input, useTheme, Row, TextArea } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TextProps } from 'react-native';

import { InputText } from './InputText';
import { FontAwesomeButton } from '../FontAwesomeButton';
import { StoreManager } from '../StoreManager';
import {
  ItemFormStoreSpecificValuesStoreModal,
  ItemFormStoreSpecificValuesStoreModalOnConfirmValues,
} from '../modals/ItemFormStoreSpecificValuesStoreModal';
import { ItemSearchModal } from '../modals/ItemSearchModal';
import { ItemTileCopyModal } from '../tiles/ItemTileCopyModal';

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import {
  currentStoreIdSelector,
  currentStoreSelector,
  itemsListWithStoreSpecificValuesSelector,
  storeSpecificValuesMapSelector,
} from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import {
  Item,
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';
import { ItemProp } from '@/types/general';
import { ItemFormProps } from '@/types/itemForm';
import {
  camelCaseToSpacedCapitalized,
  getItemFromList,
  getKeyToUse,
  getStoreDescriptor,
} from '@/utils/helpers';
import { iterateStoreSpecificValuesMap } from '@/utils/iterateStoreSpecificValuesMap';

type ItemSearchModalValueType = string;
type ItemSearchModalValues = { [key: string]: ItemSearchModalValueType };
type ItemSearchModalValue = [string, ItemSearchModalValueType, Item | null];
type ItemFormStoreSpecificProps<T> = {
  onValueChange: (storeSpecificValues: StoreSpecificValues) => void;
} & Partial<ItemProp<T>> &
  Pick<
    ItemFormProps,
    'initialQuantity' | 'hideStoreManagerRow' | 'storeManagerProps'
  >;

/**
 *Whenever a new field for {@link StoreSpecificValueKey} is added,
 *this component needs to be manually updated to handle it.
 **/
export function ItemFormStoreSpecific(
  props: ItemFormStoreSpecificProps<ItemWithStoreSpecificValues>,
) {
  const {
    hideStoreManagerRow,
    item,
    onValueChange,
    initialQuantity,
    storeManagerProps,
  } = props;
  const theme = useTheme();
  const currentStore = useAppSelector(currentStoreSelector);
  const currentStoreId = useAppSelector(currentStoreIdSelector);
  const keyToUse = useMemo(
    () =>
      getKeyToUse({
        _id: item?._id || EMPTY_STRING,
        name: item?.name || EMPTY_STRING,
        upc: item?.upc || EMPTY_STRING,
      }),
    [item],
  );
  const storeNameWithLocation = useMemo(
    () => getStoreDescriptor(currentStore),
    [currentStore],
  );
  const itemInList = useAppSelector(
    itemsListWithStoreSpecificValuesSelector(keyToUse),
  );
  const storeSpecificValuesMap = useAppSelector(storeSpecificValuesMapSelector);

  //See the two useEffects below when adding new fields (keys)
  const [aisleNumber, setAisleNumber] = useState(
    storeSpecificValuesMap?.[currentStoreId]?.[
      StoreSpecificValueKey.AisleNumber
    ] || EMPTY_STRING,
  );
  const [itemId, setItemId] = useState(
    storeSpecificValuesMap?.[currentStoreId]?.[
      StoreSpecificValueKey.ItemId
    ]?.toString() || EMPTY_STRING,
  );
  const [note, setNote] = useState(
    storeSpecificValuesMap?.[currentStoreId]?.[StoreSpecificValueKey.Note] ||
      EMPTY_STRING,
  );
  const [price, setPrice] = useState(
    storeSpecificValuesMap?.[currentStoreId]?.[
      StoreSpecificValueKey.Price
    ]?.toString() || EMPTY_STRING,
  );
  const [quantity, setQuantity] = useState(
    storeSpecificValuesMap?.[currentStoreId]?.[
      StoreSpecificValueKey.Quantity
    ] || EMPTY_NUMBER,
  );
  const [shouldDisplayStoreToUseModal, setShouldDisplayStoreToUseModal] =
    useState(false);
  const lastSavedValueRef = useRef({} as StoreSpecificValues);

  const [itemSearchModalValues, setItemSearchModalValues] =
    useState<ItemSearchModalValues>({});
  const [copyModalKey, setcopyModalKey] = useState<string>(EMPTY_STRING);
  const inputTextTextProps = useMemo(
    () =>
      ({
        numberOfLines: 1,
      }) as TextProps,
    [],
  );

  const findItemsWithStoreSpecificValueKey = useCallback(
    (storeSpecificValueKeyInput: StoreSpecificValueKey) => {
      const valuesToShow: ItemSearchModalValues = {};
      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap,
        onNewStoreSpecificValueStart: (input) => {
          const { itemKey, storeSpecificValueKey, storeSpecificValueKeyValue } =
            input;
          if (storeSpecificValueKey === storeSpecificValueKeyInput) {
            const currentStoreValue =
              storeSpecificValueKeyValue?.[currentStoreId];

            if (currentStoreValue) {
              valuesToShow[itemKey] = currentStoreValue.toString();
            }
          }
        },
      });
      return valuesToShow;
    },
    [storeSpecificValuesMap, currentStoreId],
  );

  const getCurrentValues = useCallback(() => {
    if (!currentStoreId) return {};
    const currentValues = {
      [StoreSpecificValueKey.AisleNumber]: {
        [currentStoreId]: aisleNumber,
      },
      [StoreSpecificValueKey.ItemId]: {
        [currentStoreId]: itemId,
      },
      [StoreSpecificValueKey.Note]: {
        [currentStoreId]: note,
      },
      [StoreSpecificValueKey.Price]: {
        [currentStoreId]: Math.abs(parseFloat(price) || EMPTY_NUMBER),
      },
      [StoreSpecificValueKey.Quantity]: {
        [currentStoreId]: quantity,
      },
      [StoreSpecificValueKey.IsInCart]: {
        [currentStoreId]: false,
      },
    };
    return currentValues;
  }, [currentStoreId, aisleNumber, itemId, note, price, quantity]);

  useEffect(() => {
    const aisleNumberToShow = (storeSpecificValuesMap[keyToUse] as any)?.[
      StoreSpecificValueKey.AisleNumber
    ]?.[currentStoreId];
    const itemIdToShow = (storeSpecificValuesMap[keyToUse] as any)?.[
      StoreSpecificValueKey.ItemId
    ]?.[currentStoreId];
    const noteToShow = (storeSpecificValuesMap[keyToUse] as any)?.[
      StoreSpecificValueKey.Note
    ]?.[currentStoreId];
    const priceToShow = (storeSpecificValuesMap[keyToUse] as any)?.[
      StoreSpecificValueKey.Price
    ]?.[currentStoreId]?.toString();
    const quantityToShow = (storeSpecificValuesMap[keyToUse] as any)?.[
      StoreSpecificValueKey.Quantity
    ]?.[currentStoreId]?.toString();

    setAisleNumber(aisleNumberToShow);
    setItemId(itemIdToShow);
    setNote(noteToShow);
    setPrice(priceToShow);
    setQuantity(quantityToShow);
  }, [storeSpecificValuesMap[keyToUse]]);

  useEffect(() => {
    const aisleNumberToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.AisleNumber]?.[
        currentStoreId
      ] ||
      item?.[StoreSpecificValueKey.AisleNumber]?.[currentStoreId] ||
      itemInList?.[StoreSpecificValueKey.AisleNumber]?.[currentStoreId] ||
      EMPTY_STRING;
    const itemIdToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.ItemId]?.[
        currentStoreId
      ] ||
      item?.[StoreSpecificValueKey.ItemId]?.[currentStoreId] ||
      itemInList?.[StoreSpecificValueKey.ItemId]?.[currentStoreId] ||
      EMPTY_STRING;
    const noteToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.Note]?.[
        currentStoreId
      ] ||
      item?.[StoreSpecificValueKey.Note]?.[currentStoreId] ||
      itemInList?.[StoreSpecificValueKey.Note]?.[currentStoreId] ||
      EMPTY_STRING;
    const priceToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.Price]?.[
        currentStoreId
      ]?.toString() ||
      item?.[StoreSpecificValueKey.Price]?.[currentStoreId].toString() ||
      itemInList?.[StoreSpecificValueKey.Price]?.[currentStoreId]?.toString() ||
      EMPTY_STRING;
    const quantityToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.Quantity]?.[
        currentStoreId
      ] ||
      item?.[StoreSpecificValueKey.Quantity]?.[currentStoreId] ||
      itemInList?.[StoreSpecificValueKey.Quantity]?.[currentStoreId] ||
      initialQuantity ||
      EMPTY_NUMBER;

    setAisleNumber(aisleNumberToShow);
    setItemId(itemIdToShow);
    setNote(noteToShow);
    setPrice(priceToShow);
    setQuantity(quantityToShow);
    //NOTE: adding itemInList to deps array causes infinite loop (works without it though since the item doesn't change here)
  }, [currentStoreId, lastSavedValueRef]);

  useEffect(() => {
    const currentValues = getCurrentValues();
    if (_.isEqual(currentValues, lastSavedValueRef.current)) return;
    const valueToSave = _.merge(lastSavedValueRef.current, currentValues);
    lastSavedValueRef.current = valueToSave;
    onValueChange && onValueChange(valueToSave);
  }, [getCurrentValues, onValueChange]);

  if (!currentStoreId) return null;
  return (
    <Stack>
      {hideStoreManagerRow ? null : (
        <Row alignItems="flex-end">
          <Row flex={1} mr={theme.space[FORM_INTER_ITEM_SPACING]}>
            <StoreManager showStoreList {...storeManagerProps} />
          </Row>
          {keyToUse ? (
            <FontAwesomeButton
              name="copy"
              style={{ paddingBottom: theme.space[4] }}
              onPress={() => {
                setShouldDisplayStoreToUseModal(true);
              }}
            />
          ) : null}
        </Row>
      )}
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Price at '{storeNameWithLocation}'
        </InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          placeholder="Price"
          value={(price || EMPTY_STRING).toString()}
          onChangeText={(newValue) => setPrice(newValue)}
          InputRightElement={
            <FontAwesomeButton
              name="copy"
              style={{ paddingRight: theme.space[FORM_INTER_ITEM_SPACING] * 4 }}
              onPress={() => {
                const values = findItemsWithStoreSpecificValueKey(
                  StoreSpecificValueKey.Price,
                );
                setItemSearchModalValues(values);
                setcopyModalKey(StoreSpecificValueKey.Price);
              }}
            />
          }
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Quantity needed at '{storeNameWithLocation}'
        </InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          placeholder="Quantity"
          value={(quantity || EMPTY_STRING).toString()}
          onChangeText={(newValue) => setQuantity(parseInt(newValue, 10))}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Item id at '{storeNameWithLocation}'
        </InputText>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Item Id"
          value={itemId}
          onChangeText={(newValue) => setItemId(newValue)}
          InputRightElement={
            <FontAwesomeButton
              name="copy"
              style={{ paddingRight: theme.space[FORM_INTER_ITEM_SPACING] * 4 }}
              onPress={() => {
                const values = findItemsWithStoreSpecificValueKey(
                  StoreSpecificValueKey.ItemId,
                );
                setItemSearchModalValues(values);
                setcopyModalKey(StoreSpecificValueKey.ItemId);
              }}
            />
          }
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Aisle # at '{storeNameWithLocation}'
        </InputText>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Aisle #"
          value={(aisleNumber || EMPTY_STRING).toString()}
          onChangeText={(newValue) => setAisleNumber(newValue)}
          InputRightElement={
            <FontAwesomeButton
              name="copy"
              style={{ paddingRight: theme.space[FORM_INTER_ITEM_SPACING] * 4 }}
              onPress={() => {
                const values = findItemsWithStoreSpecificValueKey(
                  StoreSpecificValueKey.AisleNumber,
                );
                setItemSearchModalValues(values);
                setcopyModalKey(StoreSpecificValueKey.AisleNumber);
              }}
            />
          }
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Note for '{storeNameWithLocation}'
        </InputText>
        <TextArea
          p={theme.space[1]}
          placeholder="Note"
          value={(note || EMPTY_STRING).toString()}
          onChangeText={(newValue) => setNote(newValue || EMPTY_STRING)}
          autoCompleteType={false}
        />
      </Stack>
      <ItemSearchModal<ItemSearchModalValue>
        title={`Item ${camelCaseToSpacedCapitalized(copyModalKey)}s`}
        isVisible={Object.keys(itemSearchModalValues || {}).length > 0}
        onCancel={() => setItemSearchModalValues({})}
        onConfirm={(selectedValue) => {
          const valueToUse = selectedValue?.[1];
          setItemSearchModalValues({});
          if (copyModalKey === StoreSpecificValueKey.AisleNumber) {
            setAisleNumber(valueToUse || EMPTY_STRING);
          } else if (copyModalKey === StoreSpecificValueKey.ItemId) {
            setItemId(valueToUse || EMPTY_STRING);
          } else if (copyModalKey === StoreSpecificValueKey.Price) {
            setPrice(valueToUse || EMPTY_STRING);
          }
        }}
        onGetFilteredValues={(items, filterValue) => {
          const isNumbersOnly = filterValue.match(/^\s*\d+\s*$/);
          const filteredValues = items.filter(([key, value, item]) => {
            const valueToMatch = isNumbersOnly
              ? item?.upc || EMPTY_STRING
              : item?.name || EMPTY_STRING;

            if (valueToMatch?.match(filterValue)) {
              return [key, value];
            }
          });
          return filteredValues;
        }}
        onGetValuesList={(items) => {
          const entries: ItemSearchModalValue[] = [];
          let i = 0;
          for (const [key, value] of Object.entries(
            itemSearchModalValues || {},
          )) {
            const item = getItemFromList(items, key);
            entries[i] = [key, value, item];
            i++;
          }

          //sort entries by name if available otherwise by store specific value
          entries.sort((a, b) => {
            let valueA = a[1];
            let valueB = b[1];
            if (a[2]?.name && b[2]?.name) {
              valueA = a[2]?.name;
              valueB = b[2]?.name;
            }
            if (valueA === valueB) return 0;
            return valueA > valueB ? 1 : -1;
          });
          return entries;
        }}
        onRenderChildren={(item) => {
          const { item: itemToRender } = item;
          const [key, value] = itemToRender;
          return <ItemTileCopyModal itemKey={key} value={String(value)} />;
        }}
      />
      <ItemFormStoreSpecificValuesStoreModal
        title="Select a Store"
        itemWithStoreSpecificValues={itemInList}
        isVisible={shouldDisplayStoreToUseModal}
        onCancel={() => setShouldDisplayStoreToUseModal(false)}
        onConfirm={(
          values: ItemFormStoreSpecificValuesStoreModalOnConfirmValues,
        ) => {
          const { aisleNumber, itemId, price, note } = values;
          setShouldDisplayStoreToUseModal(false);

          if (aisleNumber) {
            setAisleNumber(aisleNumber || EMPTY_STRING);
          }
          if (itemId) {
            setItemId(itemId);
          }
          if (price) {
            setPrice(price);
          }
          if (note) {
            setNote(note);
          }
        }}
      />
    </Stack>
  );
}
