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
          false: theme.colors.red[200],
          true: theme.colors.green[900],
        }}
        thumbColor={shouldMockResponse ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={shouldMockResponse}
      />
    </Row>
  );
}
