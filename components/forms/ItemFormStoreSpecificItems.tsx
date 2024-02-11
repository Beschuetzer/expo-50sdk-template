import { Stack, FormControl, Input, Row, useTheme, Button } from "native-base";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";

import { FrequencyInput } from "./FrequencyInput";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { UnitInput } from "./UnitInput";
import { AbsolutePositionedScreen } from "../AbsolutelyPositionedScreen";
import { InputValidationMessage } from "../InputValidationMessage";

import {
  DEFAULT_IMAGE_INDEX,
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from "@/constants/general";
import {
  LOCAL_FILE_REGEX,
  UPC_REGEX,
  UPC_REQUIRED_CHAR_LENGTH,
} from "@/constants/regexs";
import {
  currentStoreSelector,
  itemsListItemSelector,
} from "@/state/slices/listsSlice";
import { Item, StoreSpecificValues } from "@/types/Item";
import { ItemProp } from "@/types/general";
import { deleteFile, getKeyToUse } from "@/utils/helpers";

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
    itemInList?.aisle?.[currentStore?.name || EMPTY_STRING] || EMPTY_STRING,
  );
  const [itemId, setItemId] = useState(
    itemInList?.itemId?.[currentStore?.name || EMPTY_STRING] || EMPTY_STRING,
  );
  const [price, setPrice] = useState(
    itemInList?.price?.[currentStore?.name || EMPTY_STRING].toString() ||
      EMPTY_STRING,
  );
  const [quantity, setQuantity] = useState(
    itemInList?.quantity?.[currentStore?.name || EMPTY_STRING] || EMPTY_NUMBER,
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

  if (!currentStore) return null;
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
