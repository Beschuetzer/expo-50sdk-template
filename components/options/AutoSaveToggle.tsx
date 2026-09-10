import { Text } from '@gluestack-ui/themed';
import { useCallback } from 'react';

import { ToggleWithText } from './ToggleWithText';

import { autoSaveSelector, setAutoSave } from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';

/**
 *Toggles `TaskForm`'s auto-save-on-edit behavior (see `optionsSlice.autoSave`).
 **/
export function AutoSaveToggle() {
  const autoSave = useAppSelector(autoSaveSelector);
  const dispatch = useAppDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(setAutoSave(!autoSave));
  }, [autoSave, dispatch]);

  return (
    <ToggleWithText
      switchProps={{ onValueChange: toggleSwitch, value: autoSave }}
    >
      <Text mr="$1">Auto-save Tasks</Text>
    </ToggleWithText>
  );
}
