import { useTheme, Text } from 'native-base';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ToggleWithText } from './ToggleWithText';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  canOverrideItemSelector,
  setCanOverrideItem,
} from '@/state/slices/optionsSlice';

export function CanOverrideItemToggle() {
  const theme = useTheme();
  const canOverrideItem = useSelector(canOverrideItemSelector);
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(setCanOverrideItem(!canOverrideItem));
  }, [canOverrideItem]);

  return (
    <ToggleWithText
      switchProps={{
        onValueChange: toggleSwitch,
        value: canOverrideItem,
      }}
    >
      <Text mr={theme.space[FORM_INTER_ITEM_SPACING]}>
        Items can be overriden
      </Text>
    </ToggleWithText>
  );
}
