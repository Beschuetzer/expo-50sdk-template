import { useDispatch } from 'react-redux'

import { useGpsCoordinate } from '@/components/hooks/useGeoLocation'
import { ShoppingList } from '@/components/lists/ShoppingLIst'
import { setCurrentLocation } from '@/state/slices/listsSlice'

export default function TabOneScreen() {
  const dispatch = useDispatch()
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate))
    },
  })

  return <ShoppingList />
}
