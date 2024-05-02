import { useTheme, Text } from 'native-base';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ToggleWithText } from './ToggleWithText';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { autoSaveSelector, setAutoSave } from '@/state/slices/optionsSlice';

export function AutoSaveToggle() {
  const theme = useTheme();
  const autoSave = useSelector(autoSaveSelector);
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(setAutoSave(!autoSave));
  }, [autoSave]);

  return (
    <ToggleWithText
      switchProps={{
        onValueChange: toggleSwitch,
        value: autoSave,
      }}
    >
      <Text mr={theme.space[FORM_INTER_ITEM_SPACING]}>Auto Save Items</Text>
    </ToggleWithText>
  );
}
