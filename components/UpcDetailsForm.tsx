import {
  View,
  Stack,
  FormControl,
  Input,
  Row,
  useTheme,
  Text,
  Column,
  Center,
  Button,
} from "native-base";
import { Checkbox } from "expo-checkbox";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { UPC_REGEX, UPC_REQUIRED_CHAR_LENGTH } from "@/constants/regexs";
import { EMPTY_STRING } from "@/constants/general";
import { InputValidationMessage } from "./InputValidationMessage";
import { FrequencyInput } from "./FrequencyInput";
import { maxWidthCentered } from "@/constants/styles";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { saveImageLocally } from "@/utils/helpers";
import { useSelector } from "react-redux";
import { upcProductToDisplaySelector } from "@/state/slices/generalSlice";
import { UpcProduct } from "@/types/UpcResponse";

type UpcDetailsFormProps = {
  onClose: () => void;
};

function getProductNameValue(upcProduct: UpcProduct) {
  return `${upcProduct.brands} - ${upcProduct.product_name}` || EMPTY_STRING;
}

function getUpcValue(upcProduct: UpcProduct){
  return upcProduct.code || upcProduct.id || EMPTY_STRING;
}

const SHOULD_SAVE_TO_DEVICE_INITIAL = true;

/**
*NOTE: Be sure to update and new POS in the useEffect below
**/
export function UpcDetailsForm(props: UpcDetailsFormProps) {
  const upcProduct = useSelector(upcProductToDisplaySelector);
  const { onClose } = props;
  const theme = useTheme();
  const [selectedUrl, setSelectedUrl] = useState(EMPTY_STRING);
  const [upcValue, setUpcValue] = useState(getUpcValue(upcProduct));
  const [productNameValue, setProductNameValue] = useState(getProductNameValue(upcProduct));
  const [shouldSaveToDevice, setShouldSaveToDevice] = useState(
    SHOULD_SAVE_TO_DEVICE_INITIAL
  );
  const frequencyInMsRef = useRef<number>(-1);
  const isUpcValid = useMemo(
    () => upcValue.length === 0 || !!UPC_REGEX.test(upcValue || EMPTY_STRING),
    [upcValue]
  );

  const onSavePress = useCallback(async () => {
    let imageUriOnDevice = "";
    alert(JSON.stringify({ shouldSaveToDevice }, null, 2));
    if (shouldSaveToDevice) {
      try {
        imageUriOnDevice = await saveImageLocally(
          {
            name: productNameValue,
            upc: upcValue,
          },
          selectedUrl
        );
      } catch (error) {
        console.log({ error });
      }
    }

    const imageUriToUse = imageUriOnDevice || selectedUrl;
    alert(
      JSON.stringify(
        {
          imageUriOnDevice,
          imageUriToUse,
        },
        null,
        2
      )
    );
  }, [shouldSaveToDevice, selectedUrl]);

  /**
  *Need to load the new values when upcProduct changes
  **/
  useEffect(() => {
    setProductNameValue(getProductNameValue(upcProduct));
    setUpcValue(getUpcValue(upcProduct));
  }, [upcProduct])

  return (
    <FormControl {...maxWidthCentered}>
      <Stack>
        <Column space={theme.space[1]} m={theme.space[1]}>
          <Stack flex={1}>
            <FormControl.Label>Upc</FormControl.Label>
            <Input
              variant="outline"
              keyboardType="numeric"
              p={theme.space[1]}
              placeholder="UPC Code"
              value={upcValue}
              onChangeText={(newText) => setUpcValue(newText)}
              isInvalid={!UPC_REGEX.test(upcValue || EMPTY_STRING)}
            />
            <InputValidationMessage
              isValid={isUpcValid}
              message={`Must be ${UPC_REQUIRED_CHAR_LENGTH} numbers (currently ${upcValue.length} chars)`}
            />
          </Stack>
          <Stack flex={1}>
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
            <Row
              space={theme.space[1]}
              alignItems={"center"}
              onTouchStart={() => setShouldSaveToDevice((current) => !current)}
            >
              <Checkbox
                value={shouldSaveToDevice}
                color={
                  shouldSaveToDevice ? theme.colors.primary[900] : undefined
                }
              />
              <Text>Save thumbnail to device?</Text>
            </Row>
            <ThumbnailPicker
              selectedUrl={selectedUrl}
              setSelectedUrl={setSelectedUrl}
              upcProduct={upcProduct}
            />
          </Stack>
          <FrequencyInput
            onValueChange={(frequencyInMs) => {
              frequencyInMsRef.current = frequencyInMs;
            }}
            headingTag={FormControl.Label}
          />
          <Row space={1}>
            <Button flex={1} onPress={onSavePress}>
              Save
            </Button>
            <Button flex={1} onPress={() => onClose && onClose()}>
              Close
            </Button>
          </Row>
        </Column>
      </Stack>
    </FormControl>
  );
}
