import { Button, ButtonText, ScrollView, Text } from '@gluestack-ui/themed';
import { useCallback } from 'react';

import { ReduxViewer } from '@/components/mocks/ReduxViewer';
import { MockResponseToggle } from '@/components/options/MockResponseToggle';
import { ServiceTester } from '@/components/services/manual-testing/ServiceTester';
import { resetTasksSlice } from '@/state/slices/tasksSlice';
import { persistor, useAppDispatch } from '@/state/store';
import { getBackendUrl, getIsDevelopmentMode } from '@/utils/helpers';

export default function DevOptionsScreen() {
  const dispatch = useAppDispatch();

  const onFlushPress = useCallback(() => {
    persistor.flush();
    persistor.purge();
    dispatch(resetTasksSlice());
  }, [dispatch]);

  if (!getIsDevelopmentMode()) return null;
  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <ServiceTester />
      <Text>Using backend at: {getBackendUrl()}</Text>
      <MockResponseToggle />
      <ReduxViewer />
      <Button onPress={onFlushPress}>
        <ButtonText>Flush Redux Store</ButtonText>
      </Button>
    </ScrollView>
  );
}
