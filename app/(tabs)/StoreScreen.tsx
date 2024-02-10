import { useNavigation } from 'expo-router'
import { useDispatch } from 'react-redux'

import { StoreForm } from '@/components/forms/StoreForm'
import { addStoresListItem } from '@/state/slices/listsSlice'
import { Button, Row, Stack, View } from 'native-base'
import { StoresList } from '@/components/lists/StoresList'
import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen'
import { InputValidationMessage } from '@/components/InputValidationMessage'
import { Routes } from '@/constants/navigation'

export default function StoreScreen() {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  function onAddStorePress() {
    navigation.navigate(Routes.StoreModal, { name: 'name here' })
  }

  return (
    <View>
      <Button onPress={onAddStorePress}>Add Store</Button>
      <StoresList />
    </View>
  )
}
