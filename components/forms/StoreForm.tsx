import { Stack, FormControl, Input, Row, useTheme, Button } from "native-base";
import { useMemo, useState } from "react";

import { AbsolutePositionedScreen } from "../AbsolutelyPositionedScreen";

import { EMPTY_STRING } from "@/constants/general";
import { Item } from "@/types/Item";

type StoreFormValdation = {
  isValid: boolean;
  message: string;
};

type StoreFormProps = {
  onClose: () => void;
  onSave: (item: Item) => void;
};

const INTER_ITEM_SPACING = 0.5;
export function StoreForm(props: StoreFormProps) {
  const { onClose, onSave } = props;
  const theme = useTheme();
  const [storeName, setStoreName] = useState(EMPTY_STRING);

  const formValidation: StoreFormValdation = useMemo(() => {
    const isValid = storeName.length > 0;
    return {
      isValid,
      message: isValid ? EMPTY_STRING : "A store name must be given",
    };
  }, [storeName]);

  function onClosePress() {
    onClose && onClose();
  }

  function onSavePress() {
    const itmeToSave = {};
    onSave && onSave(itmeToSave);
    onClose && onClose();
  }

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
        </>
      }
    >
      <Stack mt={theme.space[INTER_ITEM_SPACING]}>
        <FormControl.Label>Name</FormControl.Label>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Store Name"
          value={storeName}
          onChangeText={(newText) => setStoreName(newText)}
          isInvalid={storeName.length <= 0}
        />
      </Stack>
    </AbsolutePositionedScreen>
  );
}
