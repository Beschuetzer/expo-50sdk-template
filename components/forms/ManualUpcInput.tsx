import { useNavigation } from 'expo-router';
import { Button, Input, View, Text, useTheme, Row } from 'native-base';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureResponderEvent } from 'react-native';

import { InputValidationMessage } from '../InputValidationMessage';
import { MOCKS_UPCS } from '../mocks/mockUpcData';

import { EMPTY_STRING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { UPC_REGEX, UPC_REQUIRED_CHAR_LENGTH } from '@/constants/regexs';

type ManualUpcInputProps = {
  isVisible?: boolean;
};

const DEBOUNCE_TIMEOUT = 500;
const VALUE_INITIAL = '';
const IS_VALID_INITIAL = true;

function getIsValidValue(value: string) {
  return !!UPC_REGEX.test(value);
}

export function ManualUpcInput(props: ManualUpcInputProps) {
  const { isVisible = true } = props;
  const timeoutRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isValid, setIsValid] = useState(IS_VALID_INITIAL);
  const [value, setValue] = useState<string>(VALUE_INITIAL);
  const theme = useTheme();
  const navigation = useNavigation();

  const onSearchPress = useCallback(
    (e: GestureResponderEvent) => {
      e.preventDefault();
      if (getIsValidValue(value)) {
        navigation.navigate(Routes.ItemModal, {
          key: { upc: value, name: EMPTY_STRING },
          showOverrideMsg: false,
        });
      }
    },
    [value],
  );

  const handleSetIsValid = useCallback((value: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsValid(getIsValidValue(value));
    }, DEBOUNCE_TIMEOUT);
  }, []);

  const onValueChange = useCallback(
    (text: string) => {
      const newValue = text.trim();
      setValue(newValue);
      handleSetIsValid(newValue);
    },
    [setIsValid, setValue],
  );

  useEffect(() => {
    setValue(VALUE_INITIAL);
    setIsValid(IS_VALID_INITIAL);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  if (!isVisible) return null;
  return (
    <View>
      <Text p={3} pb={0}>
        Enter the Upc:
      </Text>
      <Input
        ref={inputRef}
        m={3}
        keyboardType="numeric"
        placeholder="UPC Number"
        onChangeText={onValueChange}
        value={value}
        focusOutlineColor={isValid ? 'primary.100' : 'red.200'}
      />
      <InputValidationMessage
        style={{
          margin: theme.sizes[3],
          marginTop: 0,
        }}
        isValid={isValid}
        message={`Must be ${UPC_REQUIRED_CHAR_LENGTH} numbers (currently ${value.length} chars)`}
      />
      <Row space={1}>
        {MOCKS_UPCS.map((mock) => {
          return (
            <Button flex={1} onPress={() => onValueChange(mock)}>
              Mock {mock}
            </Button>
          );
        })}
      </Row>
      <Button
        isDisabled={!isValid || value.length === 0}
        backgroundColor="secondary.900"
        borderRadius={0}
        onPress={onSearchPress}
      >
        Search
      </Button>
    </View>
  );
}
