import { ScrollView } from 'native-base'

import { Playground } from '@/components/Playground'
import { StoreManager } from '@/components/StoreManager'
import { ItemsList } from '@/components/lists/ItemsList'
import { ReduxViewer } from '@/components/stateTesting/ReduxViewer'
import { useSelector } from 'react-redux'
import { itemsListSelector } from '@/state/slices/listsSlice'

export default function TabOneScreen() {
  const itemsList = useSelector(itemsListSelector);

  console.log({itemsList: itemsList.images});

  return (
    <ScrollView py={2} keyboardShouldPersistTaps="always">
      <ReduxViewer />
      <StoreManager showAddStore={true} showStoreList={true}/>
      <ItemsList />
      {/* <Playground /> */}
    </ScrollView>
  )
}
