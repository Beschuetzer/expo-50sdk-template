import { ScrollView } from 'native-base';

import { StoreManager } from '@/components/StoreManager';
import { ReduxViewer } from '@/components/mocks/ReduxViewer';
import { AutoSetStoreToggle } from '@/components/options/AutoSetStoreToggle';
import { MockResponseToggle } from '@/components/options/MockResponseToggle';

export default function OptionsScreen() {
  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <MockResponseToggle />
      <AutoSetStoreToggle />
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
    </ScrollView>
  );
}
