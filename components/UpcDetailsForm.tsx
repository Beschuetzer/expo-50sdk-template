import { View, Stack, FormControl, Input, Row, useTheme, Text } from "native-base";
import { Checkbox } from "expo-checkbox";
import { UpcProductProp } from "@/types/general";
import { useState } from "react";
import { ThumbnailPicker } from "./ThumbnailPicker";

type UpcDetailsFormProps = UpcProductProp;

const SELECTED_URL_INITIAL = "";
const SHOULD_SAVE_TO_DEVICE_INITIAL = true;
export function UpcDetailsForm(props: UpcDetailsFormProps) {
  const { upcProduct } = props;
  const theme = useTheme();
  const [selectedUrl, setSelectedUrl] = useState(SELECTED_URL_INITIAL);
  const [shouldSaveToDevice, setShouldSaveToDevice] = useState(
    SHOULD_SAVE_TO_DEVICE_INITIAL
  );

  //todo: figure out how to do validation for upc and code (one must be given)
  //todo: figure out how to save the image ()
  return (
    <FormControl>
      <Stack>
        <Row space={theme.space[1]} m={theme.space[1]}>
          <Stack flex={1}>
            <FormControl.Label>Upc</FormControl.Label>
            <Input
              variant="outline"
              p={theme.space[1]}
              placeholder="UPC Code"
            />
          </Stack>
          <Stack flex={1}>
            <FormControl.Label>Name</FormControl.Label>
            <Input
              variant="outline"
              p={theme.space[1]}
              placeholder="Product Name"
            />
          </Stack>
        </Row>
        <Stack space={theme.space[1]} m={theme.space[1]}>
          <FormControl.Label>Image</FormControl.Label>
          <Input
            variant="outline"
            p={theme.space[1]}
            placeholder="Thumbnail Image Url"
            value={selectedUrl}
          />
          <Row space={2} alignItems={"center"} onTouchStart={() => setShouldSaveToDevice(current => !current)}>
            <Checkbox
              value={shouldSaveToDevice}
              color={shouldSaveToDevice ? theme.colors.primary[900] : undefined}
            />
            <Text>Save thumbnail to Cache?</Text>
          </Row>
          <ThumbnailPicker
            selectedUrl={selectedUrl}
            setSelectedUrl={setSelectedUrl}
            upcProduct={upcProduct}
          />
        </Stack>
      </Stack>
    </FormControl>
  );
}
