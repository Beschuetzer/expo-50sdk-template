import { ScrollView } from 'native-base'

import { StoreManager } from '@/components/StoreManager'
import { MockResponseToggle } from '@/components/mocks/MockResponseToggle'
import { ReduxViewer } from '@/components/mocks/ReduxViewer'

export default function OptionsScreen() {
  return (
    <ScrollView py={2} keyboardShouldPersistTaps="always">
      <MockResponseToggle />
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
      {/* <ShoppingList /> */}
      {/* <ItemsList /> */}
      {/* <Playground /> */}
    </ScrollView>
  )
}
