import { Row, useTheme, Text } from 'native-base';
import { useCallback } from 'react';
import { Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { AUTO_SET_STORE_DISTANCE_THRESHOLD } from '@/constants/general';
import {
  autoSetStoreWhenCloseEnoughSelector,
  setAutoSetStoreWhenCloseEnough,
} from '@/state/slices/optionsSlice';

type AutoSetStoreToggleProps = object;

export function AutoSetStoreToggle(props: AutoSetStoreToggleProps) {
  const theme = useTheme();
  const autoSelectStore = useSelector(autoSetStoreWhenCloseEnoughSelector);
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(setAutoSetStoreWhenCloseEnough(!autoSelectStore));
  }, [autoSelectStore]);

  return (
    <Row alignItems="center">
      <Text mr={theme.space[1]}>
        Auto Set Store when within {AUTO_SET_STORE_DISTANCE_THRESHOLD}mi.
      </Text>
      <Switch
        trackColor={{
          false: theme.colors.secondary[200],
          true: theme.colors.primary[200],
        }}
        thumbColor={
          autoSelectStore
            ? theme.colors.primary[900]
            : theme.colors.secondary[900]
        }
        ios_backgroundColor={theme.colors.black[400]}
        onValueChange={toggleSwitch}
        value={autoSelectStore}
      />
    </Row>
  );
}
