import { Picker } from '@react-native-picker/picker';
import { Text, Input, useTheme } from 'native-base';
import React, { useState } from 'react';

import { InputText } from './InputText';

import { EMPTY_STRING } from '@/constants/general';
import { State } from '@/types/general';

type AddressFormProps = {
  onValueChange?: () => void;
};

export function AddressForm(props: AddressFormProps) {
  const { onValueChange } = props;
  const theme = useTheme();

  const [addressLineOne, setAddressLineOne] = useState(EMPTY_STRING);
  const [addressLineTwo, setAddressLineTwo] = useState(EMPTY_STRING);
  const [city, setCity] = useState(EMPTY_STRING);
  const [zipCode, setZipCode] = useState(EMPTY_STRING);
  const [state, setState] = useState<State>(State.None);

  return (
    <>
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
    </>
  );
}
