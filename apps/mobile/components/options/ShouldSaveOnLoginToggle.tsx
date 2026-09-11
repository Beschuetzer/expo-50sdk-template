import { Text } from '@gluestack-ui/themed';
import { useCallback } from 'react';

import { ToggleWithText } from './ToggleWithText';

import {
  setShouldSaveOnLogin,
  shouldSaveOnLoginSelector,
} from '@/state/slices/generalSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';

export function ShouldSaveOnLoginToggle() {
  const shouldSaveOnLogin = useAppSelector(shouldSaveOnLoginSelector);
  const dispatch = useAppDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(setShouldSaveOnLogin(!shouldSaveOnLogin));
  }, [shouldSaveOnLogin]);

  return (
    <ToggleWithText
      switchProps={{
        onValueChange: toggleSwitch,
        value: shouldSaveOnLogin,
      }}
    >
      <Text mr="$1">Save on Login</Text>
    </ToggleWithText>
  );
}
