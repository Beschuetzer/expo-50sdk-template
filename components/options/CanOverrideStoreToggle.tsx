import { useTheme, Text } from 'native-base';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ToggleWithText } from './ToggleWithText';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  canOverrideStoreSelector,
  setCanOverrideStore,
} from '@/state/slices/optionsSlice';

export function CanOverrideStoreToggle() {
  const theme = useTheme();
  const canOverrideStore = useSelector(canOverrideStoreSelector);
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(setCanOverrideStore(!canOverrideStore));
  }, [canOverrideStore]);

  return (
    <ToggleWithText
      switchProps={{
        onValueChange: toggleSwitch,
        value: canOverrideStore,
      }}
    >
      <Text mr={theme.space[FORM_INTER_ITEM_SPACING]}>
        Stores can be overriden
      </Text>
    </ToggleWithText>
  );
}
