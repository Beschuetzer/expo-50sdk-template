import { Text } from '@gluestack-ui/themed';
import { useCallback } from 'react';
import { Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  shouldMockBffResponsesSelector,
  toggleShouldMockBffResponses,
} from '@/state/slices/generalSlice';

type MockResponseToggleProps = object;

export function MockResponseToggle(props: MockResponseToggleProps) {
  const shouldMockResponse = useSelector(shouldMockBffResponsesSelector);
  const dispatch = useDispatch();

  const toggleSwitch = useCallback(() => {
    dispatch(toggleShouldMockBffResponses());
  }, [dispatch]);

  return (
    <>
      <Text mr="$1">Mock BFF Responses</Text>
      <Switch
        trackColor={{ false: '#94a3b8', true: '#93c5fd' }}
        thumbColor={shouldMockResponse ? '#1e40af' : '#475569'}
        ios_backgroundColor="#000"
        onValueChange={toggleSwitch}
        value={shouldMockResponse}
      />
    </>
  );
}
