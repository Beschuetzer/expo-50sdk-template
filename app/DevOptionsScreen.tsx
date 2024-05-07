import { Button, ScrollView } from 'native-base';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { StoreManager } from '@/components/StoreManager';
import { ReduxViewer } from '@/components/mocks/ReduxViewer';
import { MockResponseToggle } from '@/components/options/MockResponseToggle';
import { migrateItems, resetListSlice } from '@/state/slices/listsSlice';
import { persistor } from '@/state/store';

export default function OptionsScreen() {
  const dispatch = useDispatch();

  const onMigrateItemsPress = useCallback(() => {
    dispatch(migrateItems());
  }, []);

  const onFlushPress = useCallback(() => {
    persistor.flush();
    persistor.purge();
    dispatch(resetListSlice());
  }, [persistor]);

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <MockResponseToggle />
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
      <Button onPress={onMigrateItemsPress}>Migrate Items</Button>
      <Button onPress={onFlushPress}>Flush Redux Store</Button>
    </ScrollView>
  );
}
