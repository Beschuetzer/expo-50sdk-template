import { ScrollView } from 'native-base'

import { Playground } from '@/components/Playground'
import { StoreManager } from '@/components/StoreManager'
import { ItemsList } from '@/components/lists/ItemsList'
import { ReduxViewer } from '@/components/stateTesting/ReduxViewer'

export default function TabOneScreen() {
  return (
    <ScrollView py={2} keyboardShouldPersistTaps="always">
      <ReduxViewer />
      <StoreManager showAddStore={true} showStoreList={true}/>
      <ItemsList />
      {/* <Playground /> */}
    </ScrollView>
  )
}
