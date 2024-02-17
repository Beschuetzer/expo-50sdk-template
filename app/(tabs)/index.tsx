import { useDispatch } from 'react-redux'

import { useGpsCoordinate } from '@/components/hooks/useGeoLocation'
import { ShoppingList } from '@/components/lists/ShoppingLIst'
import { setCurrentLocation } from '@/state/slices/listsSlice'
import { View, Text } from 'native-base'

export default function TabOneScreen() {
  const dispatch = useDispatch()
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate))
    },
  })

  return (
    <View>
      <Text>
        Test
      </Text>
      {/* <ShoppingList /> */}
    </View>
  )
}
