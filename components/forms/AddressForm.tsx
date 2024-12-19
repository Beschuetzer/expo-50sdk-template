import { Picker } from '@react-native-picker/picker';
import { Text, Input, useTheme, Column, Row } from 'native-base';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ColorValue, Dimensions } from 'react-native';

import { InputText } from './InputText';
import FocusInput from '../FocusInput';

import {
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  TYPING_DEBOUNCE_THRESHOLD,
  US_COUNTRY_CODE,
  VALID_COUNTRY_CODES,
} from '@/constants/general';
import { Address, AddressGeneric, State } from '@/types/general';
import { isAddressValid } from '@/utils/helpers';

type AddressFormSuffix = {
  text: string;
  color?: ColorValue;
};

type AddressFormOption<T> = {
  suffix?: AddressFormSuffix;
  isVisible?: boolean;
  name?: string;
  value?: T;
};

type AddressFormOptions = Partial<
  Omit<AddressGeneric<AddressFormOption<string>>, 'state'>
> & {
  state?: AddressFormOption<State>;
};

type AddressFormProps = {
  options?: AddressFormOptions;
  onValueChange?: (address: Address, isValid: boolean) => void;
  /**
   *The debounce time between calls of onValueChange
   **/
  onValueChangeTimeout?: number;
};

function getAddressFromOptions(options: AddressFormProps['options']) {
  return {
    addressLineOne:
      options?.addressLineOne?.value?.split(',')[0] || EMPTY_STRING,
    addressLineTwo: options?.addressLineTwo?.value || EMPTY_STRING,
    city: options?.city?.value || EMPTY_STRING,
    country: options?.country?.value || US_COUNTRY_CODE,
    state: options?.state?.value || State.None,
    zipCode: options?.zipCode?.value || EMPTY_STRING,
  };
}

export function AddressForm(props: AddressFormProps) {
  const { options, onValueChange, onValueChangeTimeout } = props;
  const theme = useTheme();
  const debounceRef = useRef<any>();
  const [address, setAddress] = useState<Address>(
    getAddressFromOptions(options),
  );

  const defaultSuffixColor = useMemo(() => theme.colors.red[900], [theme]);
  const fieldOneName = useMemo(
    () => options?.addressLineOne?.name || 'Address Line 1',
    [options],
  );
  const fieldTwoName = useMemo(
    () => options?.addressLineTwo?.name || 'Address Line 2',
    [options],
  );
  const cityName = useMemo(() => options?.city?.name || 'City', [options]);
  const countryName = useMemo(
    () => options?.country?.name || 'Country',
    [options],
  );
  const stateName = useMemo(() => options?.state?.name || 'State', [options]);
  const zipName = useMemo(
    () => options?.zipCode?.name || 'Zip/Postal Code',
    [options],
  );
  const countryValue = useMemo(
    () =>
      address.country?.trim().length > 2
        ? address.country
            .split(' ')
            .map((word) => word[0].toUpperCase())
            .join('')
        : address.country || EMPTY_STRING,
    [address.country],
  );

  useEffect(() => {
    if (!onValueChange) return;
    clearTimeout(debounceRef.current);

    if (onValueChangeTimeout !== undefined && onValueChangeTimeout <= 0) {
      onValueChange(address, isAddressValid(address));
      return;
    }

    debounceRef.current = setTimeout(() => {
      onValueChange(address, isAddressValid(address));
    }, onValueChangeTimeout || TYPING_DEBOUNCE_THRESHOLD);
  }, [address]);

  useEffect(() => {
    setAddress(getAddressFromOptions(options));
  }, [
    options?.addressLineOne?.value,
    options?.addressLineTwo?.value,
    options?.country?.value,
    options?.city?.value,
    options?.state?.value,
    options?.zipCode?.value,
  ]);

  return (
    <Column
      space={theme.space[FORM_INTER_ITEM_SPACING]}
      py={theme.space[FORM_INTER_ITEM_SPACING]}
    >
      {options?.addressLineOne?.isVisible === false ? null : (
        <>
          <InputText
            suffix={
              <Text
                color={
                  options?.addressLineOne?.suffix?.color?.toString() ||
                  defaultSuffixColor
                }
              >
                &nbsp;{options?.addressLineOne?.suffix?.text.trim()}
              </Text>
            }
          >
            {fieldOneName}
          </InputText>
          <FocusInput
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder={fieldOneName}
            value={address?.addressLineOne}
            onChangeText={(newValue) =>
              setAddress((current) => ({
                ...current,
                addressLineOne: newValue,
              }))
            }
            isInvalid={!address?.addressLineOne.trim()}
          />
        </>
      )}
      {options?.addressLineTwo?.isVisible === false ? null : (
        <>
          <InputText
            suffix={
              <Text
                color={
                  options?.addressLineTwo?.suffix?.color?.toString() ||
                  defaultSuffixColor
                }
              >
                &nbsp;{options?.addressLineTwo?.suffix?.text.trim()}
              </Text>
            }
          >
            {fieldTwoName}
          </InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder={fieldTwoName}
            value={address?.addressLineTwo}
            onChangeText={(newValue) =>
              setAddress((current) => ({
                ...current,
                addressLineTwo: newValue,
              }))
            }
          />
        </>
      )}
      {options?.city?.isVisible === false ? null : (
        <>
          <InputText
            suffix={
              <Text
                color={
                  options?.city?.suffix?.color?.toString() || defaultSuffixColor
                }
              >
                &nbsp;{options?.city?.suffix?.text.trim()}
              </Text>
            }
          >
            {cityName}
          </InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder={cityName}
            value={address.city}
            onChangeText={(newValue) =>
              setAddress((current) => ({
                ...current,
                city: newValue,
              }))
            }
          />
        </>
      )}
      {options?.state?.isVisible === false ? null : (
        <>
          <InputText
            suffix={
              <Text
                color={
                  options?.state?.suffix?.color?.toString() ||
                  defaultSuffixColor
                }
              >
                &nbsp;{options?.state?.suffix?.text.trim()}
              </Text>
            }
          >
            {stateName}
          </InputText>
          <Row width={Dimensions.get('window').width * 0.5} maxWidth={200}>
            <Picker
              style={{ flex: 1 }}
              selectedValue={address.state}
              onValueChange={(newValue) =>
                setAddress((current) => ({
                  ...current,
                  state: newValue,
                }))
              }
            >
              {Object.values(State).map((state) => (
                <Picker.Item key={state} label={state} value={state} />
              ))}
            </Picker>
          </Row>
        </>
      )}
      {options?.zipCode?.isVisible === false ? null : (
        <>
          <InputText
            suffix={
              <Text
                color={
                  options?.zipCode?.suffix?.color?.toString() ||
                  defaultSuffixColor
                }
              >
                &nbsp;{options?.zipCode?.suffix?.text.trim()}
              </Text>
            }
          >
            {zipName}
          </InputText>
          <Input
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            flex={1}
            placeholder={zipName}
            value={address.zipCode}
            onChangeText={(newValue) =>
              setAddress((current) => ({
                ...current,
                zipCode: newValue,
              }))
            }
          />
        </>
      )}
      {options?.country?.isVisible === false ? null : (
        <>
          <InputText
            suffix={
              <Text
                color={
                  options?.country?.suffix?.color?.toString() ||
                  defaultSuffixColor
                }
              >
                &nbsp;{options?.country?.suffix?.text.trim()}
              </Text>
            }
          >
            {countryName}
          </InputText>
          <Input
            variant="outline"
            p={theme.space[1]}
            flex={1}
            placeholder="Two Letter Country Code"
            value={countryValue}
            isInvalid={!VALID_COUNTRY_CODES.includes(countryValue)}
            onChangeText={(newValue) =>
              setAddress((current) => ({
                ...current,
                country: newValue.trim().replace(/\d/g, '').substring(0, 2),
              }))
            }
          />
        </>
      )}
    </Column>
  );
}
