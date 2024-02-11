import { ScrollView } from 'native-base'

import { Playground } from '@/components/Playground'
import { StoreManager } from '@/components/StoreManager'
import { ItemsList } from '@/components/lists/ItemsList'
import { ReduxViewer } from '@/components/mocks/ReduxViewer'
import { useDispatch, useSelector } from 'react-redux'
import { useGpsCoordinate } from '@/components/hooks/useGeoLocation'
import { setCurrentLocation } from '@/state/slices/generalSlice'

export default function TabOneScreen() {
  const dispatch = useDispatch()
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate))
    },
  })

  return (
    <ScrollView py={2} keyboardShouldPersistTaps="always">
      <ReduxViewer />
      <StoreManager showAddStore={true} showStoreList={true} />
      <ItemsList />
      {/* <Playground /> */}
    </ScrollView>
  )
}
