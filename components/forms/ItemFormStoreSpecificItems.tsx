import { Picker } from '@react-native-picker/picker';
import { Stack, Input, useTheme, Button } from 'native-base';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { InputText } from './InputText';
import { ItemFormProps } from './ItemForm';
import { ItemFormStoreSpecificValuesStoreModal } from '../modals/ItemFormStoreSpecificValuesStoreModal';

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import {
  ListName,
  currentStoreSelector,
  itemsListWithStoreSpecificValuesSelector,
  listToDisplaySelector,
} from '@/state/slices/listsSlice';
import {
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
  StoreSpecificValues,
} from '@/types/Item';
import { Store } from '@/types/Store';
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
  const storesList = useSelector(
    listToDisplaySelector(ListName.StoresList),
  ) as Store[];
  const storesListWithEmptyItem = useMemo(
    () => [...storesList, { name: EMPTY_STRING }] as Store[],
    [storesList],
  );

  //initial values are set in useEffect below
  const [aisleNumber, setAisleNumber] = useState(EMPTY_NUMBER);
  const [itemId, setItemId] = useState(EMPTY_STRING);
  const [price, setPrice] = useState(EMPTY_STRING);
  const [quantity, setQuantity] = useState(EMPTY_NUMBER);
  const [selectedStoreToUse, setSelectedStoreToUse] =
    useState<string>(EMPTY_STRING);
  const [shoulddisplayStoreToUsePicker, setShouldDisplayStoreToUsePicker] =
    useState(false);

  useEffect(() => {
    console.log({ selectedStoreToUse });
    if (!selectedStoreToUse) return;
    const storeSpecificValueKeys = Object.values(
      StoreSpecificValueKey,
    ) as string[];
    for (const [key, storeSpecificValueKey] of Object.entries(itemInList)) {
      console.log({ key, storeSpecificValueKey, storeSpecificValueKeys });
      if (storeSpecificValueKeys.includes(key)) {
        const valueToUse = (storeSpecificValueKey as any)?.[selectedStoreToUse];
        console.log({ valueToUse });
        switch (key) {
          case StoreSpecificValueKey.AisleNumber:
            setAisleNumber(valueToUse || EMPTY_STRING);
            break;
          case StoreSpecificValueKey.ItemId:
            setItemId(valueToUse || EMPTY_STRING);
            break;
          case StoreSpecificValueKey.Price:
            setPrice(valueToUse || EMPTY_STRING);
            break;
          default:
            break;
        }
        setSelectedStoreToUse(EMPTY_STRING);
      }
    }
  }, [selectedStoreToUse, itemInList]);

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
      {shoulddisplayStoreToUsePicker ? (
        <Picker
          selectedValue={selectedStoreToUse}
          onValueChange={(value: string | null) => {
            setSelectedStoreToUse(value || EMPTY_STRING);
          }}
        >
          {storesListWithEmptyItem.map((store) => (
            <Picker.Item
              key={store.name}
              label={store.name || 'None'}
              value={store.name}
            />
          ))}
        </Picker>
      ) : (
        <Button
          m={0}
          p={0}
          variant="link"
          onPress={() => {
            setShouldDisplayStoreToUsePicker(true);
          }}
        >
          use existing
        </Button>
      )}
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
      <ItemFormStoreSpecificValuesStoreModal />
    </Stack>
  );
}
