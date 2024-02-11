import { Stack, FormControl, Input, useTheme } from "native-base";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from "@/constants/general";
import {
  currentStoreSelector,
  itemsListItemSelector,
} from "@/state/slices/listsSlice";
import { StoreSpecificValues } from "@/types/Item";
import { ItemProp } from "@/types/general";
import { getKeyToUse } from "@/utils/helpers";

type ItemFormProps = {
  onValueChange: (storeSpecificValues: StoreSpecificValues) => void;
} & ItemProp;

export function ItemFormStoreSpecific(props: ItemFormProps) {
  const { item, onValueChange } = props;
  const theme = useTheme();
  const keyToUse = useMemo(
    () =>
      getKeyToUse(
        { name: item.name || EMPTY_STRING, upc: item.upc || EMPTY_STRING },
        false,
      ),
    [item],
  );
  const currentStore = useSelector(currentStoreSelector);
  const itemInList = useSelector(itemsListItemSelector(keyToUse));

  const [aisle, setAisle] = useState(
    itemInList?.aisle?.[currentStore.name] || EMPTY_STRING,
  );
  const [itemId, setItemId] = useState(
    itemInList?.itemId?.[currentStore.name] || EMPTY_STRING,
  );
  const [price, setPrice] = useState(
    itemInList?.price?.[currentStore.name]?.toString() || EMPTY_STRING,
  );
  const [quantity, setQuantity] = useState(
    itemInList?.quantity?.[currentStore.name] || EMPTY_NUMBER,
  );

  useEffect(() => {
    if (!currentStore?.name) return;
    onValueChange &&
      onValueChange({
        aisle: {
          [currentStore.name]: aisle,
        },
        itemId: {
          [currentStore.name]: itemId,
        },
        price: {
          [currentStore.name]: parseFloat(price),
        },
        quantity: {
          [currentStore.name]: quantity,
        },
      });
  }, [aisle, itemId, price, quantity, currentStore, onValueChange]);

  if (!currentStore.name) return null;
  return (
    <Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <FormControl.Label>Price</FormControl.Label>
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
        <FormControl.Label>Quantity</FormControl.Label>
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
        <FormControl.Label>Item Id</FormControl.Label>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder={`Item identifier for ${currentStore.name}`}
          value={itemId}
          onChangeText={(newValue) => setItemId(newValue)}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <FormControl.Label>Aisle</FormControl.Label>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder={`Aisle in ${currentStore.name}`}
          value={aisle}
          onChangeText={(newValue) => setAisle(newValue)}
        />
      </Stack>
    </Stack>
  );
}
