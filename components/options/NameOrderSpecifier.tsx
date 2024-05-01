import { Column, Input, Row, Text, useTheme } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  nameOrderTemplateSelector,
  setNameOrderTemplate,
} from '@/state/slices/optionsSlice';

type NameOrderSpecifierProps = object;

const DEBOUNCE_TIMEOUT = 366;
export function NameOrderSpecifier(props: NameOrderSpecifierProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const nameOrderTemplate = useSelector(nameOrderTemplateSelector);
  const [nameOrderTemplateValue, setNameOrderTemplateValue] =
    useState(nameOrderTemplate);
  const debounceTimeoutRef = useRef<any>();

  useEffect(() => {
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      dispatch(setNameOrderTemplate(nameOrderTemplateValue));
    }, DEBOUNCE_TIMEOUT);
  }, [nameOrderTemplateValue]);

  return (
    <Column>
      <Row alignItems="center" space={theme.space[FORM_INTER_ITEM_SPACING]}>
        <Text>Name Order Template:</Text>
        <Input
          value={nameOrderTemplateValue}
          onChangeText={(newValue) => setNameOrderTemplateValue(newValue)}
          flex={1}
        />
      </Row>
    </Column>
  );
}
