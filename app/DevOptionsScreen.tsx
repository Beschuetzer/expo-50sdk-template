import { Button, ScrollView, Text } from 'native-base';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { StoreManager } from '@/components/StoreManager';
import { ReduxViewer } from '@/components/mocks/ReduxViewer';
import { MockResponseToggle } from '@/components/options/MockResponseToggle';
import { BACKEND_URL } from '@/components/services/BffService';
import { ServiceTester } from '@/components/services/manual-testing/ServiceTester';
import { resetListSlice } from '@/state/slices/listsSlice';
import { persistor } from '@/state/store';
import { getIsDevelopmentMode } from '@/utils/helpers';

export default function DevOptionsScreen() {
  const dispatch = useDispatch();

  const onFlushPress = useCallback(() => {
    persistor.flush();
    persistor.purge();
    dispatch(resetListSlice());
  }, [persistor]);

  if (!getIsDevelopmentMode()) return null;
  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <ServiceTester />
      <Text>Using backend at: {BACKEND_URL}</Text>
      <MockResponseToggle />
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
      <Button onPress={onFlushPress}>Flush Redux Store</Button>
    </ScrollView>
  );
}
