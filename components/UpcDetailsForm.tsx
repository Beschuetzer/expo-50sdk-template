import { View, Stack, FormControl, Input, Row, useTheme } from "native-base";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { UpcProductProp } from "@/types/general";
import { useState } from "react";

type UpcDetailsFormProps = UpcProductProp;

const SELECTED_URL_INITIAL = "";
export function UpcDetailsForm(props: UpcDetailsFormProps) {
  const { upcProduct } = props;
  const theme = useTheme();
  const [selectedUrl, setSelectedUrl] = useState(SELECTED_URL_INITIAL);

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
