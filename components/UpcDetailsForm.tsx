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
import { Frequency, TimeSpan, UpcProductProp } from "@/types/general";
import { useMemo, useState } from "react";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { UPC_REGEX, UPC_REQUIRED_CHAR_LENGTH } from "@/constants/regexs";
import {
  EMPTY_STRING,
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
} from "@/constants/general";
import { InputValidationMessage } from "./InputValidationMessage";
import { Picker } from "@react-native-picker/picker";

type UpcDetailsFormProps = UpcProductProp;

const SHOULD_SAVE_TO_DEVICE_INITIAL = true;
const FREQUENCY_INITIAL = Object.freeze({
  number: 1,
  timeSpan: "Week",
} as Frequency);
export function UpcDetailsForm(props: UpcDetailsFormProps) {
  const { upcProduct } = props;
  const theme = useTheme();
  const [selectedUrl, setSelectedUrl] = useState(EMPTY_STRING);
  const [frequency, setFrequency] = useState<Frequency>({
    ...FREQUENCY_INITIAL,
  });
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
  const frequencyInMs = useMemo(
    () => TIME_SPAN_TO_MILLISECONDS_MAPPING?.[frequency.timeSpan],
    [frequency]
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
              space={theme.space[2]}
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
          <Stack>
            <FormControl.Label>Frequency</FormControl.Label>
            <Row>
              <Input
                keyboardType="numeric"
                variant="outline"
                p={theme.space[1]}
                placeholder="Number"
                value={frequency.number.toString()}
                onChangeText={(newText) =>
                  setFrequency({ ...frequency, number: Number(newText) })
                }
                isInvalid={frequency.number <= 0}
                flex={1}
              />
              <View flex={4}>
                <Picker
                  selectedValue={frequency.timeSpan}
                  onValueChange={(itemValue) =>
                    setFrequency({ ...frequency, timeSpan: itemValue })
                  }
                >
                  {Object.keys(TIME_SPAN_TO_MILLISECONDS_MAPPING).map(
                    (timespan) => (
                      <Picker.Item
                        key={timespan}
                        label={timespan}
                        value={timespan}
                      />
                    )
                  )}
                </Picker>
              </View>
            </Row>
            {frequency ? (
              <>
                <Text>Miliseconds: {frequency.number * frequencyInMs}ms</Text>
                <Text>{new Date(Date.now() + frequency.number * frequencyInMs).toLocaleString()}</Text>
              </>
            ) : null}
          </Stack>
        </Column>
      </Stack>
    </FormControl>
  );
}
