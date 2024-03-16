import { Row, useTheme, Text, Input } from 'native-base';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  autoSetStoreSelector,
  setAutoSetStore,
} from '@/state/slices/optionsSlice';

type AutoSetStoreToggleProps = object;

const AUTO_SET_DEBOUNCE_THRESHOLD = 500;
export function AutoSetStoreToggle(props: AutoSetStoreToggleProps) {
  const theme = useTheme();
  const autoSelectStore = useSelector(autoSetStoreSelector);
  const [autoSetDistance, setAutoSetDistance] = useState(
    autoSelectStore.maxDistanceInMiles.toString(),
  );
  const autoSetDebounceRef = useRef<any>(-1);
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(
      setAutoSetStore({
        enabled: !autoSelectStore.enabled,
        maxDistanceInMiles: autoSelectStore.maxDistanceInMiles,
      }),
    );
  }, [autoSelectStore]);

  useEffect(() => {
    clearTimeout(autoSetDebounceRef.current);
    autoSetDebounceRef.current = setTimeout(() => {
      dispatch(
        setAutoSetStore({
          enabled: autoSelectStore.enabled,
          maxDistanceInMiles: parseFloat(autoSetDistance),
        }),
      );
    }, AUTO_SET_DEBOUNCE_THRESHOLD);
  }, [autoSetDistance]);

  return (
    <Row alignItems="center" justifyContent="space-between">
      <Row alignItems="center">
        <Text mr={theme.space[FORM_INTER_ITEM_SPACING]}>
          Auto Set Store when within
        </Text>
        <Input
          width={theme.sizes[4]}
          keyboardType="numeric"
          value={autoSetDistance}
          onChangeText={(newValue) => setAutoSetDistance(newValue)}
        />
        <Text ml={theme.space[FORM_INTER_ITEM_SPACING]}>mi.</Text>
      </Row>
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
        value={autoSelectStore.enabled}
      />
    </Row>
  );
}
