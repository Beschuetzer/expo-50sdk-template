import { useTheme, Text } from 'native-base';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ToggleWithText } from './ToggleWithText';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  canOverrideItemSelector,
  setCanOverrideItem,
} from '@/state/slices/optionsSlice';

export const ALLOW_OVERRIDE_WHEN_SAME_UPC_MESSAGE =
  'Allow creation of items with the same UPC';
export function CanCreateMultipleItemsWithSameUpcToggle() {
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
        {ALLOW_OVERRIDE_WHEN_SAME_UPC_MESSAGE}
      </Text>
    </ToggleWithText>
  );
}
