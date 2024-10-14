import _ from 'lodash';
import { Stack, Input, useTheme, Row, TextArea } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TextProps } from 'react-native';
import { useSelector } from 'react-redux';

import { InputText } from './InputText';
import { ItemFormProps } from './ItemForm';
import { CopyValue } from '../CopyValue';
import { StoreManager } from '../StoreManager';
import CopyValueModal, { CopyModalValues } from '../modals/CopyValueModal';
import {
  ItemFormStoreSpecificValuesStoreModal,
  ItemFormStoreSpecificValuesStoreModalOnConfirmValues,
} from '../modals/ItemFormStoreSpecificValuesStoreModal';

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
import {
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';
import { ItemProp } from '@/types/general';
import { getKeyToUse } from '@/utils/helpers';
import { iterateStoreSpecificValuesMap } from '@/utils/iterateStoreSpecificValuesMap';

type ItemFormStoreSpecificProps<T> = {
  onValueChange: (storeSpecificValues: StoreSpecificValues) => void;
} & Partial<ItemProp<T>> &
  Pick<ItemFormProps, 'shouldAddQuantity'>;

/**
 *Whenever a new field for {@link StoreSpecificValueKey} is added,
 *this component needs to be manually updated to handle it.
 **/
export function ItemFormStoreSpecific(
  props: ItemFormStoreSpecificProps<ItemWithStoreSpecificValues>,
) {
  const { item, onValueChange, shouldAddQuantity } = props;
  const theme = useTheme();
  const currentStore = useSelector(currentStoreSelector);
  const currentStoreId = useSelector(currentStoreIdSelector);
  const keyToUse = useMemo(
    () =>
      getKeyToUse({
        _id: item?._id || EMPTY_STRING,
        name: item?.name || EMPTY_STRING,
        upc: item?.upc || EMPTY_STRING,
      }),
    [item],
  );
  const itemInList = useSelector(
    itemsListWithStoreSpecificValuesSelector(keyToUse),
  );
  const storeSpecificValuesMap = useSelector(storeSpecificValuesMapSelector);

  //See the two useEffects below when adding new fields (keys)
  const [aisleNumber, setAisleNumber] = useState(
    storeSpecificValuesMap?.[currentStoreId]?.[
      StoreSpecificValueKey.AisleNumber
    ] || EMPTY_NUMBER,
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

  const [copyModalValues, setCopyModalValues] = useState<CopyModalValues>({});
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
      const valuesToShow: CopyModalValues = {};
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
    const aisleNumberToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.AisleNumber]?.[
        currentStoreId
      ] ||
      itemInList?.[StoreSpecificValueKey.AisleNumber]?.[currentStoreId] ||
      EMPTY_NUMBER;
    const itemIdToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.ItemId]?.[
        currentStoreId
      ] ||
      itemInList?.[StoreSpecificValueKey.ItemId]?.[currentStoreId] ||
      EMPTY_STRING;
    const noteToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.Note]?.[
        currentStoreId
      ] ||
      itemInList?.[StoreSpecificValueKey.Note]?.[currentStoreId] ||
      EMPTY_STRING;
    const priceToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.Price]?.[
        currentStoreId
      ]?.toString() ||
      itemInList?.[StoreSpecificValueKey.Price]?.[currentStoreId]?.toString() ||
      EMPTY_STRING;
    const quantityToShow =
      lastSavedValueRef.current?.[StoreSpecificValueKey.Quantity]?.[
        currentStoreId
      ] ||
      itemInList?.[StoreSpecificValueKey.Quantity]?.[currentStoreId] ||
      (shouldAddQuantity ? 1 : EMPTY_NUMBER);

    setAisleNumber(aisleNumberToShow);
    setItemId(itemIdToShow);
    setNote(noteToShow);
    setPrice(priceToShow);
    setQuantity(quantityToShow);
    //NOTE: adding itemInList to deps array causes infinite loop (works without it though since the item doesn't change here)
  }, [currentStoreId, lastSavedValueRef]);

  useEffect(() => {
    const currentValues = getCurrentValues();
    const valueToSave = _.merge(lastSavedValueRef.current, currentValues);
    lastSavedValueRef.current = valueToSave;
    console.log({ valueToSave });
    onValueChange && onValueChange(valueToSave);
  }, [getCurrentValues, onValueChange]);

  if (!currentStoreId) return null;
  return (
    <Stack>
      <Row alignItems="flex-end">
        <Row flex={1} mr={theme.space[FORM_INTER_ITEM_SPACING]}>
          <StoreManager showStoreList />
        </Row>
        {keyToUse ? (
          <CopyValue
            style={{ paddingBottom: theme.space[4] }}
            onPress={() => {
              setShouldDisplayStoreToUseModal(true);
            }}
          />
        ) : null}
      </Row>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Price at '{currentStore.name}'
        </InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          placeholder="Price"
          value={(price || EMPTY_STRING).toString()}
          onChangeText={(newValue) => setPrice(newValue)}
          InputRightElement={
            <CopyValue
              style={{ paddingRight: theme.space[FORM_INTER_ITEM_SPACING] * 4 }}
              size={theme.sizes[4]}
              onPress={() => {
                const values = findItemsWithStoreSpecificValueKey(
                  StoreSpecificValueKey.Price,
                );
                setCopyModalValues(values);
                setcopyModalKey(StoreSpecificValueKey.Price);
              }}
            />
          }
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Quantity needed at '{currentStore.name}'
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
          Item id at '{currentStore.name}'
        </InputText>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Item Id"
          value={itemId}
          onChangeText={(newValue) => setItemId(newValue)}
          InputRightElement={
            <CopyValue
              style={{ paddingRight: theme.space[FORM_INTER_ITEM_SPACING] * 4 }}
              size={theme.sizes[4]}
              onPress={() => {
                const values = findItemsWithStoreSpecificValueKey(
                  StoreSpecificValueKey.ItemId,
                );
                setCopyModalValues(values);
                setcopyModalKey(StoreSpecificValueKey.ItemId);
              }}
            />
          }
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Aisle # at '{currentStore.name}'
        </InputText>
        <Input
          keyboardType="numeric"
          variant="outline"
          p={theme.space[1]}
          placeholder="Aisle #"
          value={(aisleNumber || EMPTY_STRING).toString()}
          onChangeText={(newValue) =>
            setAisleNumber(parseFloat(newValue) || EMPTY_NUMBER)
          }
          InputRightElement={
            <CopyValue
              style={{ paddingRight: theme.space[FORM_INTER_ITEM_SPACING] * 4 }}
              size={theme.sizes[4]}
              onPress={() => {
                const values = findItemsWithStoreSpecificValueKey(
                  StoreSpecificValueKey.AisleNumber,
                );
                setCopyModalValues(values);
                setcopyModalKey(StoreSpecificValueKey.AisleNumber);
              }}
            />
          }
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText textProps={inputTextTextProps}>
          Note for '{currentStore.name}'
        </InputText>
        <TextArea
          p={theme.space[1]}
          placeholder="Note"
          value={(note || EMPTY_STRING).toString()}
          onChangeText={(newValue) => setNote(newValue || EMPTY_STRING)}
          autoCompleteType={false}
        />
      </Stack>
      <CopyValueModal
        fieldName={copyModalKey}
        values={copyModalValues}
        onCancel={() => setCopyModalValues({})}
        onConfirm={(selectedValue: any) => {
          setCopyModalValues({});
          if (copyModalKey === StoreSpecificValueKey.AisleNumber) {
            setAisleNumber(selectedValue);
          } else if (copyModalKey === StoreSpecificValueKey.ItemId) {
            setItemId(selectedValue);
          } else if (copyModalKey === StoreSpecificValueKey.Price) {
            setPrice(selectedValue);
          }
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
            setAisleNumber(parseFloat(aisleNumber) || EMPTY_NUMBER);
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
