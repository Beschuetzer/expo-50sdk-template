import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  BottomSheetMethods,
  BottomSheetModalMethods,
} from '@gorhom/bottom-sheet/lib/typescript/types';
import { Picker } from '@react-native-picker/picker';
import { Text, Input, Stack, useTheme, Heading } from 'native-base';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dimensions, LayoutChangeEvent } from 'react-native';

import { InputText } from './forms/InputText';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { State } from '@/types/general';

type AddressBottomSheetProps = {
  onValueChange?: () => void;
};

export const AddressBottomSheet = forwardRef<
  BottomSheetMethods,
  AddressBottomSheetProps
>((props, ref) => {
  const { onValueChange } = props;
  const theme = useTheme();
  const innerRef = useRef<BottomSheetModalMethods>(null);
  useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);

  const [addressLineOne, setAddressLineOne] = useState(EMPTY_STRING);
  const [addressLineTwo, setAddressLineTwo] = useState(EMPTY_STRING);
  const [city, setCity] = useState(EMPTY_STRING);
  const [zipCode, setZipCode] = useState(EMPTY_STRING);
  const [state, setState] = useState<State>(State.None);
  const [snapPoint, setSnapPoint] = useState('1%');
  const windowDimensions = useMemo(() => Dimensions.get('window'), []);
  const snapPoints = useMemo(() => [snapPoint], [snapPoint]);
  const headerHeight = 61;

  const onContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event?.nativeEvent?.layout?.height;
      const heightAsPercent = `${Math.ceil(((height + headerHeight) / windowDimensions.height) * 100)}%`;
      setSnapPoint(heightAsPercent);
    },
    [snapPoint, windowDimensions, headerHeight],
  );

  return (
    <BottomSheetModal ref={innerRef} index={0} snapPoints={snapPoints}>
      <Heading
        size="md"
        textAlign="center"
        p={theme.space[FORM_INTER_ITEM_SPACING]}
      >
        Geocoding
      </Heading>
      <BottomSheetScrollView>
        <Stack
          px={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          pb={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          space={theme.space[FORM_INTER_ITEM_SPACING]}
          onLayout={onContentLayout}
        >
          <InputText suffix={<Text color={theme.colors.red[900]}> *</Text>}>
            Address Line 1
          </InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Address Line 1"
            value={addressLineOne}
            onChangeText={(newValue) => setAddressLineOne(newValue)}
            isInvalid={!addressLineOne.trim()}
          />
          <InputText>Address Line 2</InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Address Line 2"
            value={addressLineTwo}
            onChangeText={(newValue) => setAddressLineTwo(newValue)}
          />
          <InputText>City</InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="City"
            value={city}
            onChangeText={(newValue) => setCity(newValue)}
          />
          <InputText>State</InputText>
          <Picker
            style={{ flex: 1 }}
            selectedValue={state}
            onValueChange={(newValue) => setState(newValue)}
          >
            {Object.values(State).map((state) => (
              <Picker.Item key={state} label={state} value={state} />
            ))}
          </Picker>
          <InputText>Zip/Postal Code</InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Zip/Postal Code"
            value={zipCode}
            onChangeText={(newValue) => setZipCode(newValue)}
          />
        </Stack>

        {/* todo: delete this stack */}
        {/* <Stack
          px={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          pb={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          space={theme.space[FORM_INTER_ITEM_SPACING]}
          onLayout={onContentLayout}
        >
          <InputText suffix={<Text color={theme.colors.red[900]}> *</Text>}>
            Address Line 1
          </InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Address Line 1"
            value={addressLineOne}
            onChangeText={(newValue) => setAddressLineOne(newValue)}
            isInvalid={!addressLineOne.trim()}
          />
          <InputText>Address Line 2</InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Address Line 2"
            value={addressLineTwo}
            onChangeText={(newValue) => setAddressLineTwo(newValue)}
          />
          <InputText>City</InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="City"
            value={city}
            onChangeText={(newValue) => setCity(newValue)}
          />
          <InputText>State</InputText>
          <Picker
            style={{ flex: 1 }}
            selectedValue={state}
            onValueChange={(newValue) => setState(newValue)}
          >
            {Object.values(State).map((state) => (
              <Picker.Item key={state} label={state} value={state} />
            ))}
          </Picker>
          <InputText>Zip/Postal Code</InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Zip/Postal Code"
            value={zipCode}
            onChangeText={(newValue) => setZipCode(newValue)}
          />
        </Stack> */}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
