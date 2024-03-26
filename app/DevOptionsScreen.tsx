import { Button, ScrollView } from 'native-base';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { StoreManager } from '@/components/StoreManager';
import { ReduxViewer } from '@/components/mocks/ReduxViewer';
import { MockResponseToggle } from '@/components/options/MockResponseToggle';
import { migrateItems } from '@/state/slices/listsSlice';

export default function OptionsScreen() {
  const dispatch = useDispatch();

  const onMigrateItemsPress = useCallback(() => {
    dispatch(migrateItems());
  }, []);

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <MockResponseToggle />
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
      <Button onPress={onMigrateItemsPress}>Migrate Items</Button>
    </ScrollView>
  );
}
