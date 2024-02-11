import { Stack, FormControl, Input, Row, useTheme, Button } from "native-base";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { FrequencyInput } from "./FrequencyInput";
import { ItemFormStoreSpecific } from "./ItemFormStoreSpecificItems";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { UnitInput } from "./UnitInput";
import { AbsolutePositionedScreen } from "../AbsolutelyPositionedScreen";
import { InputValidationMessage } from "../InputValidationMessage";

import {
  DEFAULT_IMAGE_INDEX,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from "@/constants/general";
import {
  LOCAL_FILE_REGEX,
  UPC_REGEX,
  UPC_REQUIRED_CHAR_LENGTH,
} from "@/constants/regexs";
import { itemsListItemSelector } from "@/state/slices/listsSlice";
import { Item, StoreSpecificValues } from "@/types/Item";
import { ItemProp } from "@/types/general";
import { deleteFile, displayAlert, getKeyToUse } from "@/utils/helpers";

type ItemFormValdation = {
  isValid: boolean;
  message: string;
};

type ItemFormProps = {
  onClose: () => void;
  onSave: (item: Item) => void;
  showOverrideMsg?: boolean;
} & ItemProp;

export function ItemForm(props: ItemFormProps) {
  const { onClose, onSave, item, showOverrideMsg = true } = props;
  const theme = useTheme();
  const keyToUse = useMemo(
    () =>
      getKeyToUse(
        { name: item.name || EMPTY_STRING, upc: item.upc || EMPTY_STRING },
        false,
      ),
    [item],
  );
  const itemInList = useSelector(itemsListItemSelector(keyToUse));
  const itemInListUsingName = useSelector(
    itemsListItemSelector(item.name || EMPTY_STRING),
  );
  const [selectedUrl, setSelectedUrl] = useState(
    itemInList?.images[itemInList?.imageToUseIndex] ||
      item.images[item.imageToUseIndex] ||
      EMPTY_STRING,
  );
  const [upcValue, setUpcValue] = useState(item.upc || EMPTY_STRING);
  const [productNameValue, setProductNameValue] = useState(
    item.name || EMPTY_STRING,
  );
  const frequencyInMsRef = useRef<number>(-1);
  const unitRef = useRef<string>(EMPTY_STRING);
  const isUpcValid = useMemo(
    () => upcValue?.length === 0 || !!UPC_REGEX.test(upcValue || EMPTY_STRING),
    [upcValue],
  );
  const formValidation: ItemFormValdation = useMemo(() => {
    const isValid = (isUpcValid && upcValue.length > 0) || !!productNameValue;
    return {
      isValid,
      message: isValid
        ? EMPTY_STRING
        : "A unique key must be given for each item.  Please enter either a 'Upc' or a 'Name'",
    };
  }, [isUpcValid, upcValue, productNameValue]);
  const customImagesToDeleteOnUnloadRef = useRef<string[]>([]);
  const shouldDeleteLastImageRef = useRef(true);

  function onClosePress() {
    shouldDeleteLastImageRef.current = true;
    onClose && onClose();
  }

  function onSavePress() {
    const itemToSave = {
      frequency: frequencyInMsRef.current,
      unit: unitRef.current,
      images: item.images || [],
      imageToUseIndex:
        item.images.findIndex((image) => {
          return image === selectedUrl;
        }) || DEFAULT_IMAGE_INDEX,
      name: productNameValue,
      upc: upcValue,
    } as Item;

    console.log({ itemToSave });

    if (!itemToSave.images.includes(selectedUrl)) {
      itemToSave.images.push(selectedUrl);
      itemToSave.imageToUseIndex = itemToSave.images.length - 1;
    }

    shouldDeleteLastImageRef.current = false;
    onSave && onSave(itemToSave);
    onClose && onClose();
  }

  const onFrequencyChange = useCallback(
    (frequencyInMs: number) => {
      frequencyInMsRef.current = frequencyInMs;
    },
    [frequencyInMsRef],
  );

  const onItemSpecificValueChange = useCallback(
    (state: StoreSpecificValues) => {
      console.log({state});
    },
    [],
  );

  const onUnitChange = useCallback((unit: string) => {
    unitRef.current = unit;
  }, []);

  useEffect(() => {
    return () => {
      for (
        let index = 0;
        index < customImagesToDeleteOnUnloadRef.current.length;
        index++
      ) {
        const imageUrl = customImagesToDeleteOnUnloadRef.current[index];
        if (
          index === customImagesToDeleteOnUnloadRef.current.length - 1 &&
          shouldDeleteLastImageRef.current === false
        )
          break;
        deleteFile(imageUrl);
      }
    };
  }, []);

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <Row space={3}>
            <Button
              isDisabled={!formValidation.isValid}
              flex={1}
              onPress={onSavePress}
            >
              Save
            </Button>
            <Button flex={1} onPress={onClosePress}>
              Close
            </Button>
          </Row>
          <InputValidationMessage
            isValid={formValidation.isValid}
            message={formValidation.message}
          />
          <InputValidationMessage
            isValid={
              !showOverrideMsg || !upcValue ? !itemInListUsingName : !itemInList
            }
            message={`An item with the key of '${upcValue && productNameValue ? keyToUse : !upcValue && productNameValue ? productNameValue : upcValue}' is already in the list and will be overriden.`}
          />
        </>
      }
    >
      <Stack>
        <FormControl.Label>Upc</FormControl.Label>
        <Input
          variant="outline"
          keyboardType="numeric"
          p={theme.space[1]}
          placeholder="UPC Code"
          value={upcValue}
          onChangeText={(newText) => setUpcValue(newText)}
          isInvalid={
            (!UPC_REGEX.test(upcValue || EMPTY_STRING) &&
              upcValue.length !== 0) ||
            productNameValue.length === 0
          }
        />
        <InputValidationMessage
          isValid={isUpcValid}
          message={`Must be ${UPC_REQUIRED_CHAR_LENGTH} numbers (currently ${upcValue.length} chars)`}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <FormControl.Label>Name</FormControl.Label>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Product Name"
          value={productNameValue}
          onChangeText={(newText) => setProductNameValue(newText)}
          isInvalid={productNameValue.length <= 0}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <FormControl.Label>Image</FormControl.Label>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Thumbnail Image Url"
          value={selectedUrl}
        />
        <ThumbnailPicker
          spacing={theme.space[FORM_INTER_ITEM_SPACING]}
          selectedUrl={selectedUrl}
          onSelectImage={(url, isCustomImage) => {
            if (isCustomImage) {
              customImagesToDeleteOnUnloadRef.current.push(url);
              item.images = item.images.filter((imageUrl) => {
                const shouldKeep = !imageUrl?.match(LOCAL_FILE_REGEX);
                if (!shouldKeep) {
                  deleteFile(imageUrl);
                }
                return shouldKeep;
              });
              item.images.push(url);
            }
            setSelectedUrl(url);
          }}
          imagesToRender={new Set(item.images)}
        />
      </Stack>
      <FrequencyInput
        onValueChange={onFrequencyChange}
        headingTag={FormControl.Label}
        spacing={theme.space[FORM_INTER_ITEM_SPACING]}
      />
      <UnitInput
        initialValue={itemInList?.unit}
        onValueChange={onUnitChange}
        headingTag={FormControl.Label}
        spacing={theme.space[FORM_INTER_ITEM_SPACING]}
      />
      <ItemFormStoreSpecific
        item={item}
        onValueChange={onItemSpecificValueChange}
      />
    </AbsolutePositionedScreen>
  );
}
