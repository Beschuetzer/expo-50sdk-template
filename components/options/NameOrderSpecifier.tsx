import { Column, Input, Row, Text, useTheme } from 'native-base';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { nameOrderTemplateSelector } from '@/state/slices/optionsSlice';

type NameOrderSpecifierProps = object;

export function NameOrderSpecifier(props: NameOrderSpecifierProps) {
  const {} = props;
  const theme = useTheme();
  const nameOrderTemplate = useSelector(nameOrderTemplateSelector);
  const [nameOrderTemplateValue, setNameOrderTemplateValue] =
    useState(nameOrderTemplate);

  return (
    <Column>
      <Row alignItems={"center"} space={theme.space[FORM_INTER_ITEM_SPACING]}>
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
