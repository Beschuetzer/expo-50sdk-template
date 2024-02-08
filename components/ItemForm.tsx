import { Stack, FormControl, Input, Row, useTheme, Button } from "native-base";
import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { AbsolutePositionedScreen } from "./AbsolutelyPositionedScreen";
import { FrequencyInput } from "./FrequencyInput";
import { InputValidationMessage } from "./InputValidationMessage";
import { ThumbnailPicker } from "./ThumbnailPicker";

import { DEFAULT_IMAGE_INDEX, EMPTY_STRING } from "@/constants/general";
import { UPC_REGEX, UPC_REQUIRED_CHAR_LENGTH } from "@/constants/regexs";
import { itemsListItemSelector } from "@/state/slices/listsSlice";
import { upcProductSelector } from "@/state/slices/scannerSlice";
import { Item } from "@/types/Item";
import { ItemProp } from "@/types/general";
import { getKeyToUse } from "@/utils/helpers";
import { getUpcProduct } from "@/utils/model-mappings";

type UpcDetailsFormValdation = {
  isValid: boolean;
  message: string;
};

type UpcDetailsFormProps = {
  onClose: () => void;
  onSave: (item: Item) => void;
  showOverrideMsg?: boolean;
} & ItemProp;

export function ItemForm(props: UpcDetailsFormProps) {
  const { onClose, onSave, item, showOverrideMsg = true } = props;
  const upcProduct = useSelector(upcProductSelector(item.upc || EMPTY_STRING));
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
  const isUpcValid = useMemo(
    () => upcValue?.length === 0 || !!UPC_REGEX.test(upcValue || EMPTY_STRING),
    [upcValue],
  );
  const formValidation: UpcDetailsFormValdation = useMemo(() => {
    const isValid = (isUpcValid && upcValue.length > 0) || !!productNameValue;
    return {
      isValid,
      message: isValid
        ? EMPTY_STRING
        : "Either a Upc or a Name must be given for each item.",
    };
  }, [isUpcValid, upcValue, productNameValue]);

  async function onSavePress() {
    const itemToSave = {
      frequency: frequencyInMsRef.current,
      images: item.images,
      imageToUseIndex:
        item.images.findIndex((image) => {
          return image === selectedUrl;
        }) || DEFAULT_IMAGE_INDEX,
      name: productNameValue,
      upc: upcValue,
    } as Item;
    onSave && onSave(itemToSave);
    onClose && onClose();
  }

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <Row space={1}>
            <Button
              isDisabled={!formValidation.isValid}
              flex={1}
              onPress={onSavePress}
            >
              Save
            </Button>
            <Button flex={1} onPress={() => onClose && onClose()}>
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
      <Stack>
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
      <Stack space={theme.space[1]}>
        <FormControl.Label>Image</FormControl.Label>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Thumbnail Image Url"
          value={selectedUrl}
        />
        <ThumbnailPicker
          selectedUrl={selectedUrl}
          onSelectImage={(url) => {
            setSelectedUrl(url);
          }}
          upcProduct={upcProduct || getUpcProduct(item)}
        />
      </Stack>
      <FrequencyInput
        onValueChange={(frequencyInMs) => {
          frequencyInMsRef.current = frequencyInMs;
        }}
        headingTag={FormControl.Label}
      />
      <Stack>
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
      <Stack>
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
    </AbsolutePositionedScreen>
  );
}
