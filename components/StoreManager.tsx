import { FontAwesome } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { useNavigation } from 'expo-router'
import { FormControl, Row, Stack } from 'native-base'
import { useCallback } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

import { Routes } from '@/constants/navigation'
import { maxWidth } from '@/constants/styles'
import {
  currentStoreSelector,
  setCurrentStore,
} from '@/state/slices/generalSlice'
import { storesListArraySelector } from '@/state/slices/listsSlice'
import { HeadingTagProp } from '@/types/general'

type StorageManagerProps = {
  showAddStore?: boolean
  showStoreList?: boolean
} & HeadingTagProp
export function StoreManager(props: StorageManagerProps) {
  const {
    showAddStore = false,
    showStoreList = false,
    headingTag: Tag = FormControl.Label
  } = props

  const currentStore = useSelector(currentStoreSelector)
  const storesListArray = useSelector(storesListArraySelector)
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const onAddPress = useCallback(() => {
    navigation.navigate(Routes.storeModal)
  }, [])

  const onChangeStore = useCallback((storeName: string) => {
    dispatch(setCurrentStore(storeName))
  }, [])

  console.log({ currentStore })

  return (
    <Stack>
      <Row
        flex={1}
        {...maxWidth}
        justifyContent="space-between"
        alignItems="center"
      >
        <Tag>Current Store: {currentStore || 'No store selected'}</Tag>
        {showAddStore ? (
          <TouchableOpacity onPress={onAddPress}>
            <FontAwesome size={28} name="plus" />
          </TouchableOpacity>
        ) : null}
      </Row>
      {showStoreList ? (
        <Picker selectedValue={currentStore} onValueChange={onChangeStore}>
          {storesListArray.map((store) => (
            <Picker.Item
              key={store.name}
              label={`${store.name} (lat: ${store.gpsCoordinates?.lat}, long: ${store.gpsCoordinates?.long})`}
              value={store.name}
            />
          ))}
        </Picker>
      ) : null}
    </Stack>
  )
}
