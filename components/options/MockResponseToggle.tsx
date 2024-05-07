import { Row, useTheme, Text } from 'native-base';
import { useCallback } from 'react';
import { Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  shouldShouldMockScannedResponsesSelector,
  toggleShouldShouldMockScannedResponses,
} from '@/state/slices/generalSlice';

type MockResponseToggleProps = object;

export function MockResponseToggle(props: MockResponseToggleProps) {
  const theme = useTheme();
  const shouldMockResponse = useSelector(
    shouldShouldMockScannedResponsesSelector,
  );
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(toggleShouldShouldMockScannedResponses());
  }, []);

  return (
    <Row alignItems="center">
      <Text mr={theme.space[1]}>Mock Scanned Responses</Text>
      <Switch
        trackColor={{
          false: theme.colors.secondary[200],
          true: theme.colors.primary[200],
        }}
        thumbColor={
          shouldMockResponse
            ? theme.colors.primary[900]
            : theme.colors.secondary[900]
        }
        ios_backgroundColor={theme.colors.black[900]}
        onValueChange={toggleSwitch}
        value={shouldMockResponse}
      />
    </Row>
  );
}
