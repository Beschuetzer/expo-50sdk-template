import { Stack, Input, useTheme, Row } from 'native-base';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const keyToUse = useMemo(
    () =>
      getKeyToUse(
        { name: item?.name || EMPTY_STRING, upc: item?.upc || EMPTY_STRING },
        false,
      ),
    [item],
  );
  const currentStore = useSelector(currentStoreSelector);
  const itemInList = useSelector(
    itemsListWithStoreSpecificValuesSelector(keyToUse),
  );
  const storeSpecificValuesMap = useSelector(storeSpecificValuesMapSelector);

  //initial values are set in useEffect below
  const [aisleNumber, setAisleNumber] = useState(EMPTY_NUMBER);
  const [itemId, setItemId] = useState(EMPTY_STRING);
  const [price, setPrice] = useState(EMPTY_STRING);
  const [quantity, setQuantity] = useState(EMPTY_NUMBER);
  const [shouldDisplayStoreToUseModal, setShouldDisplayStoreToUseModal] =
    useState(false);

  const [copyModalValues, setCopyModalValues] = useState<CopyModalValues>({});
  const [copyModalKey, setcopyModalKey] = useState<string>(EMPTY_STRING);

  const findItemsWithStoreSpecificValueKey = useCallback(
    (storeSpecificValueKeyInput: StoreSpecificValueKey) => {
      const valuesToShow: CopyModalValues = {};
      iterateStoreSpecificValuesMap({
        storeSpecificValuesMap,
        onNewStoreSpecificValue(input) {
          const { itemKey, storeSpecificValueKey, storeSpecificValueKeyValue } =
            input;
          if (storeSpecificValueKey === storeSpecificValueKeyInput) {
            const currentStoreValue =
              storeSpecificValueKeyValue?.[currentStore.name];

            if (currentStoreValue) {
              valuesToShow[itemKey] = currentStoreValue;
            }
          }
        },
      });
      return valuesToShow;
    },
    [storeSpecificValuesMap, currentStore],
  );

  useEffect(() => {
    if (!currentStore?.name) return;
    onValueChange &&
      onValueChange({
        [StoreSpecificValueKey.AisleNumber]: {
          [currentStore.name]: aisleNumber,
        },
        [StoreSpecificValueKey.ItemId]: {
          [currentStore.name]: itemId,
        },
        [StoreSpecificValueKey.Price]: {
          [currentStore.name]: Math.abs(parseFloat(price) || EMPTY_NUMBER),
        },
        [StoreSpecificValueKey.Quantity]: {
          [currentStore.name]: quantity,
        },
        [StoreSpecificValueKey.IsInCart]: {
          [currentStore.name]: false,
        },
      });
  }, [aisleNumber, itemId, price, quantity, currentStore, onValueChange]);

  useEffect(() => {
    setAisleNumber(
      itemInList?.[StoreSpecificValueKey.AisleNumber]?.[currentStore.name] ||
        EMPTY_NUMBER,
    );
    setItemId(itemInList?.itemId?.[currentStore.name] || EMPTY_STRING);
    setPrice(
      itemInList?.price?.[currentStore.name]?.toString() || EMPTY_STRING,
    );
    setQuantity(
      itemInList?.quantity?.[currentStore.name] ||
        (shouldAddQuantity ? 1 : EMPTY_NUMBER),
    );
  }, [currentStore]);

  if (!currentStore.name) return null;
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
        <InputText>Price at '{currentStore.name}'</InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          placeholder={`Price at ${currentStore.name}`}
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
        <InputText>Quantity needed at '{currentStore.name}'</InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          placeholder={`Quantity needed at ${currentStore.name}`}
          value={(quantity || EMPTY_STRING).toString()}
          onChangeText={(newValue) => setQuantity(parseInt(newValue, 10))}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Item at '{currentStore.name}' Id</InputText>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder={`Item identifier for ${currentStore.name}`}
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
        <InputText>Aisle # at '{currentStore.name}'</InputText>
        <Input
          keyboardType="numeric"
          variant="outline"
          p={theme.space[1]}
          placeholder={`Aisle in ${currentStore.name}`}
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
          const { aisleNumber, itemId, price } = values;
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
        }}
      />
    </Stack>
  );
}
