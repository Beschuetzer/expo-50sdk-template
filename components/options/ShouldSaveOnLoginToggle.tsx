import { useTheme, Text } from 'native-base';
import { useCallback } from 'react';

import { ToggleWithText } from './ToggleWithText';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  setShouldSaveOnLogin,
  shouldSaveOnLoginSelector,
} from '@/state/slices/generalSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';

export function ShouldSaveOnLoginToggle() {
  const theme = useTheme();
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
      <Text mr={theme.space[FORM_INTER_ITEM_SPACING]}>Save on Login</Text>
    </ToggleWithText>
  );
}
