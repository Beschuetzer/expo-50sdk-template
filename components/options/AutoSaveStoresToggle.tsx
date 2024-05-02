import { useTheme, Text } from 'native-base';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ToggleWithText } from './ToggleWithText';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  autoSaveStoresSelector,
  setAutoSaveStores,
} from '@/state/slices/optionsSlice';

export function AutoSaveStoresToggle() {
  const theme = useTheme();
  const autoSaveStores = useSelector(autoSaveStoresSelector);
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(setAutoSaveStores(!autoSaveStores));
  }, [autoSaveStores]);

  return (
    <ToggleWithText
      switchProps={{
        onValueChange: toggleSwitch,
        value: autoSaveStores,
      }}
    >
      <Text mr={theme.space[FORM_INTER_ITEM_SPACING]}>Auto Save Stores</Text>
    </ToggleWithText>
  );
}
