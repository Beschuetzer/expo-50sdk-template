import { Picker } from '@react-native-picker/picker';
import { Text, Input, useTheme, Column } from 'native-base';
import React, { useEffect, useState } from 'react';

import { InputText } from './InputText';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Address, State } from '@/types/general';
import { isAddressValid } from '@/utils/helpers';

type AddressFormProps = {
  onValueChange?: (address: Address, isValid: boolean) => void;
};

export function AddressForm(props: AddressFormProps) {
  const { onValueChange } = props;
  const theme = useTheme();

  const [addressLineOne, setAddressLineOne] = useState(EMPTY_STRING);
  const [addressLineTwo, setAddressLineTwo] = useState(EMPTY_STRING);
  const [city, setCity] = useState(EMPTY_STRING);
  const [zipCode, setZipCode] = useState(EMPTY_STRING);
  const [state, setState] = useState<State>(State.None);

  useEffect(() => {
    const address = {
      addressLineOne,
      addressLineTwo,
      city,
      state,
      zipCode,
    } as Address;
    onValueChange && onValueChange(address, isAddressValid(address));
  }, [addressLineOne, addressLineTwo, city, zipCode, state]);

  return (
    <Column
      space={theme.space[FORM_INTER_ITEM_SPACING]}
      py={theme.space[FORM_INTER_ITEM_SPACING]}
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
      <InputText suffix={<Text color={theme.colors.red[900]}> **</Text>}>
        City
      </InputText>
      <Input
        variant="outline"
        p={theme.space[1]}
        flex={1}
        placeholder="City"
        value={city}
        onChangeText={(newValue) => setCity(newValue)}
      />
      <InputText suffix={<Text color={theme.colors.red[900]}> **</Text>}>
        State
      </InputText>
      <Picker
        style={{ flex: 1 }}
        selectedValue={state}
        onValueChange={(newValue) => setState(newValue)}
      >
        {Object.values(State).map((state) => (
          <Picker.Item key={state} label={state} value={state} />
        ))}
      </Picker>
      <InputText suffix={<Text color={theme.colors.red[900]}> **</Text>}>
        Zip/Postal Code
      </InputText>
      <Input
        variant="outline"
        p={theme.space[1]}
        flex={1}
        placeholder="Zip/Postal Code"
        value={zipCode}
        onChangeText={(newValue) => setZipCode(newValue)}
      />
    </Column>
  );
}
