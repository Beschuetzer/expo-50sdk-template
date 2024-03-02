import { ScrollView } from 'native-base';

import { StoreManager } from '@/components/StoreManager';
import { ReduxViewer } from '@/components/mocks/ReduxViewer';
import { MockResponseToggle } from '@/components/options/MockResponseToggle';

export default function OptionsScreen() {
  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <MockResponseToggle />
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
    </ScrollView>
  );
}
