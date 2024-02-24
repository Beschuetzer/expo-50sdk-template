import { View } from 'native-base'
import { useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'
import { useDispatch } from 'react-redux'

import { useGpsCoordinate } from '@/components/hooks/useGeoLocation'
import { InCartList } from '@/components/lists/InCartList'
import { ShoppingList } from '@/components/lists/ShoppingLIst'
import { setCurrentLocation } from '@/state/slices/listsSlice'

const renderScene = SceneMap({
  first: () => <ShoppingList />,
  second: () => <InCartList />,
})

export default function TabOneScreen() {
  const dispatch = useDispatch()
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate))
    },
  })
  const layout = useWindowDimensions()

  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'first', title: 'Need' },
    { key: 'second', title: 'In Cart' },
  ])

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  )
}
