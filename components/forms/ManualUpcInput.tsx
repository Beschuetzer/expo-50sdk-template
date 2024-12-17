import { Button, Input, View, Text, useTheme, Row } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { BarcodeScannerProps } from '../BarcodeScanner';
import { InputValidationMessage } from '../InputValidationMessage';
import { MOCK_UPCS } from '../mocks/constants';

import { UPC_REQUIRED_CHAR_LENGTH } from '@/constants/regexs';
import { listToDisplaySelector } from '@/state/slices/listsSlice';
import { scanningModeSelector } from '@/state/slices/optionsSlice';
import { Item } from '@/types/Item';
import { ListName } from '@/types/listSlice';
import {
  getIsDevelopmentMode,
  getIsValidUpcValue,
  getItemFromList,
} from '@/utils/helpers';

type ManualUpcInputProps = {
  isVisible?: boolean;
  onPress: BarcodeScannerProps['onScanned'];
};

const DEBOUNCE_TIMEOUT = 500;
const VALUE_INITIAL = '';
const IS_VALID_INITIAL = true;

export function ManualUpcInput(props: ManualUpcInputProps) {
  const itemsList = useSelector(
    listToDisplaySelector(ListName.ItemsList),
  ) as Item[];
  const scanningMode = useSelector(scanningModeSelector);
  const { isVisible = true, onPress = () => null } = props;
  const timeoutRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isValid, setIsValid] = useState(IS_VALID_INITIAL);
  const [value, setValue] = useState<string>(VALUE_INITIAL);
  const theme = useTheme();
  const isDevelopmentBuild = useMemo(() => getIsDevelopmentMode(), []);

  const handleSetIsValid = useCallback((value: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsValid(getIsValidUpcValue(value));
    }, DEBOUNCE_TIMEOUT);
  }, []);

  const onSearchPress = useCallback(() => {
    onPress &&
      onPress(value, scanningMode, !!getItemFromList(itemsList, value));
  }, [onPress, value, scanningMode, itemsList]);

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
        onSubmitEditing={onSearchPress}
      />
      <InputValidationMessage
        style={{
          margin: theme.sizes[3],
          marginTop: 0,
        }}
        isValid={isValid}
        message={`Must be ${UPC_REQUIRED_CHAR_LENGTH} numbers (currently ${value.length} chars)`}
      />
      {isDevelopmentBuild ? (
        <Row space={1}>
          {MOCK_UPCS.map((mock, index) => {
            return (
              <Button key={index} flex={1} onPress={() => onValueChange(mock)}>
                Mock {mock}
              </Button>
            );
          })}
        </Row>
      ) : null}
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
