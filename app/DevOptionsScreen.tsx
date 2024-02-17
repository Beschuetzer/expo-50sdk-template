import { ScrollView } from 'native-base'

import { StoreManager } from '@/components/StoreManager'
import { ReduxViewer } from '@/components/mocks/ReduxViewer'

export default function OptionsScreen() {
  return (
    <ScrollView py={2} keyboardShouldPersistTaps="always">
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
      {/* <ShoppingList /> */}
      {/* <ItemsList /> */}
      {/* <Playground /> */}
    </ScrollView>
  )
}
