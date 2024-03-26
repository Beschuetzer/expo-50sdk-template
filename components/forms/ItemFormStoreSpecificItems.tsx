import { Stack, Input, useTheme } from 'native-base';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { InputText } from './InputText';
import { ItemFormProps } from './ItemForm';

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import {
  currentStoreSelector,
  itemsListWithStoreSpecificValuesSelector,
} from '@/state/slices/listsSlice';
import {
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';
import { ItemProp } from '@/types/general';
import { getKeyToUse } from '@/utils/helpers';

type ItemFormStoreSpecificProps<T> = {
  onValueChange: (storeSpecificValues: StoreSpecificValues) => void;
} & Partial<ItemProp<T>> &
  Pick<ItemFormProps, 'shouldAddQuantity'>;

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

  //initial values are set in useEffect below
  const [aisleNumber, setAisleNumber] = useState(EMPTY_NUMBER);
  const [itemId, setItemId] = useState(EMPTY_STRING);
  const [price, setPrice] = useState(EMPTY_STRING);
  const [quantity, setQuantity] = useState(EMPTY_NUMBER);

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
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Price at '{currentStore.name}'</InputText>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          placeholder={`Price at ${currentStore.name}`}
          value={(price || EMPTY_STRING).toString()}
          onChangeText={(newValue) => setPrice(newValue)}
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
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Aisle # at '{currentStore.name}'</InputText>
        <Input
          keyboardType="numeric"
          variant="outline"
          p={theme.space[1]}
          placeholder={`Aisle in ${currentStore.name}`}
          value={aisleNumber.toString()}
          onChangeText={(newValue) =>
            setAisleNumber(parseFloat(newValue) || EMPTY_NUMBER)
          }
        />
      </Stack>
    </Stack>
  );
}
