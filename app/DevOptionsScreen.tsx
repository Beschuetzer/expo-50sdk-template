import { Button, ScrollView, Text } from 'native-base';
import { useCallback } from 'react';

import { StoreManager } from '@/components/StoreManager';
import { ReduxViewer } from '@/components/mocks/ReduxViewer';
import { MockResponseToggle } from '@/components/options/MockResponseToggle';
import { ServiceTester } from '@/components/services/manual-testing/ServiceTester';
import { resetListSlice } from '@/state/slices/listsSlice';
import { persistor, useAppDispatch } from '@/state/store';
import { getBackendUrl, getIsDevelopmentMode } from '@/utils/helpers';

export default function DevOptionsScreen() {
  const dispatch = useAppDispatch();

  const onFlushPress = useCallback(() => {
    persistor.flush();
    persistor.purge();
    dispatch(resetListSlice());
  }, [persistor]);

  if (!getIsDevelopmentMode()) return null;
  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <ServiceTester />
      <Text>Using backend at: {getBackendUrl()}</Text>
      <MockResponseToggle />
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
      <Button onPress={onFlushPress}>Flush Redux Store</Button>
    </ScrollView>
  );
}
