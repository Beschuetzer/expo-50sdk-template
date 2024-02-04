import {
  View,
  Stack,
  FormControl,
  Input,
  Row,
  useTheme,
  Text,
  Column,
} from "native-base";
import { Checkbox } from "expo-checkbox";
import { UpcProductProp } from "@/types/general";
import { useMemo, useState } from "react";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { UPC_REGEX, UPC_REQUIRED_CHAR_LENGTH } from "@/constants/regexs";
import { EMPTY_STRING } from "@/constants/general";
import { InputValidationMessage } from "./InputValidationMessage";

type UpcDetailsFormProps = UpcProductProp;

const SHOULD_SAVE_TO_DEVICE_INITIAL = true;
export function UpcDetailsForm(props: UpcDetailsFormProps) {
  const { upcProduct } = props;
  const theme = useTheme();
  const [selectedUrl, setSelectedUrl] = useState(EMPTY_STRING);
  const [upcValue, setUpcValue] = useState(upcProduct.code || EMPTY_STRING);
  const [productNameValue, setProductNameValue] = useState(
    `${upcProduct.brands} - ${upcProduct.product_name}` || EMPTY_STRING
  );
  const [shouldSaveToDevice, setShouldSaveToDevice] = useState(
    SHOULD_SAVE_TO_DEVICE_INITIAL
  );
  const isUpcValid = useMemo(
    () => upcValue.length === 0 || !!UPC_REGEX.test(upcValue || EMPTY_STRING),
    [upcValue]
  );

  //todo: figure out how to do validation for upc and code (one must be given)
  //todo: figure out how to save the image ()
  return (
    <FormControl>
      <Stack>
        <Column space={theme.space[1]} m={theme.space[1]}>
          <Stack flex={1}>
            <FormControl.Label>Upc</FormControl.Label>
            <Input
              variant="outline"
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
              space={2}
              alignItems={"center"}
              onTouchStart={() => setShouldSaveToDevice((current) => !current)}
            >
              <Checkbox
                value={shouldSaveToDevice}
                color={
                  shouldSaveToDevice ? theme.colors.primary[900] : undefined
                }
              />
              <Text>Save thumbnail to Cache?</Text>
            </Row>
            <ThumbnailPicker
              selectedUrl={selectedUrl}
              setSelectedUrl={setSelectedUrl}
              upcProduct={upcProduct}
            />
          </Stack>
        </Column>
      </Stack>
    </FormControl>
  );
}
