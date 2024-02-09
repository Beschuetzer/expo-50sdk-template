import { Picker } from '@react-native-picker/picker'
import { FormControl, Row, Stack } from 'native-base'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  currentStoreSelector,
  setCurrentStore,
} from '@/state/slices/generalSlice'
import { storesListArraySelector } from '@/state/slices/listsSlice'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { FontAwesome } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { Routes } from '@/constants/navigation'
import { maxWidth } from '@/constants/styles'

export function StoreManager() {
  const currentStore = useSelector(currentStoreSelector)
  const storesListArray = useSelector(storesListArraySelector)
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const onAddPress = useCallback(() => {
    navigation.navigate(Routes.storeModal)
  }, [])

  const onChangeStore = useCallback((storeName: string) => {
    alert({ storeName })
    dispatch(setCurrentStore(storeName))
  }, [])

  console.log({ currentStore })

  return (
    <Stack>
      <Row
        flex={1}
        {...maxWidth}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <FormControl.Label>
          Current Store: {currentStore || 'No store selected'}
        </FormControl.Label>
        <TouchableOpacity onPress={onAddPress}>
          <FontAwesome size={28} name="plus" />
        </TouchableOpacity>
      </Row>
      <Picker selectedValue={currentStore} onValueChange={onChangeStore}>
        {storesListArray.map((store) => (
          <Picker.Item
            key={store.name}
            label={`${store.name} (lat: ${store.gpsCoordinates?.lat}, long: ${store.gpsCoordinates?.long})`}
            value={store.name}
          />
        ))}
      </Picker>
    </Stack>
  )
}
