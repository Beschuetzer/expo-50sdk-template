import { useTheme, Text } from 'native-base';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ToggleWithText } from './ToggleWithText';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  autoSaveItemsSelector,
  setAutoSaveItems,
} from '@/state/slices/optionsSlice';

export function AutoSaveItemsToggle() {
  const theme = useTheme();
  const autoSaveItems = useSelector(autoSaveItemsSelector);
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(setAutoSaveItems(!autoSaveItems));
  }, [autoSaveItems]);

  return (
    <ToggleWithText
      switchProps={{
        onValueChange: toggleSwitch,
        value: autoSaveItems,
      }}
    >
      <Text mr={theme.space[FORM_INTER_ITEM_SPACING]}>Auto Save Items</Text>
    </ToggleWithText>
  );
}
