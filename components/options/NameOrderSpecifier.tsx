import { Picker } from '@react-native-picker/picker';
import { Column, Heading, Input, Row, useTheme } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  FORM_INTER_ITEM_SPACING,
  NAME_ORDER_BRANDS_STRING,
  NAME_ORDER_PRODUCT_NAME_STRING,
} from '@/constants/general';
import {
  nameOrderTemplateSelector,
  setNameOrderTemplate,
} from '@/state/slices/optionsSlice';

type NameOrderSpecifierProps = object;

const DEBOUNCE_TIMEOUT = 366;
const ALLOWED_FIELDS = [
  'Add a field',
  NAME_ORDER_BRANDS_STRING,
  NAME_ORDER_PRODUCT_NAME_STRING,
];

export function NameOrderSpecifier(props: NameOrderSpecifierProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const nameOrderTemplate = useSelector(nameOrderTemplateSelector);
  const [nameOrderTemplateValue, setNameOrderTemplateValue] =
    useState(nameOrderTemplate);
  const [selectedPickerValue, setSelectedPickerValue] = useState<string>(
    ALLOWED_FIELDS[0],
  );
  const debounceTimeoutRef = useRef<any>();

  const onPickerValueChange = useCallback((newValue: string) => {
    setSelectedPickerValue(ALLOWED_FIELDS[0]);
    setNameOrderTemplateValue((current) => current + newValue);
  }, []);

  useEffect(() => {
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      dispatch(setNameOrderTemplate(nameOrderTemplateValue));
    }, DEBOUNCE_TIMEOUT);
  }, [nameOrderTemplateValue]);

  return (
    <Column my={theme.space[FORM_INTER_ITEM_SPACING]}>
      <Heading size="sm" textAlign="center">
        Name Order Template:
      </Heading>
      <Row alignItems="center" space={theme.space[FORM_INTER_ITEM_SPACING]}>
        <Column flex={1}>
          <Picker
            style={{ flex: 1 }}
            selectedValue={selectedPickerValue}
            onValueChange={onPickerValueChange}
          >
            {Object.values(ALLOWED_FIELDS).map((allowedField) => (
              <Picker.Item
                key={allowedField}
                label={allowedField}
                value={allowedField}
              />
            ))}
          </Picker>
        </Column>
        <Column flex={1}>
          <Input
            value={nameOrderTemplateValue}
            onChangeText={(newValue) => setNameOrderTemplateValue(newValue)}
          />
        </Column>
      </Row>
    </Column>
  );
}
