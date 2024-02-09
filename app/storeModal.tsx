import { useNavigation } from 'expo-router'
import { Center, theme, Heading, Text, View } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'

import { currentStoreSelector } from '@/state/slices/generalSlice'
import { storesListArraySelector } from '@/state/slices/listsSlice'

export default function StoreModal() {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const currentStore = useSelector(currentStoreSelector)
  const storesListArray = useSelector(storesListArraySelector)

  return (
    <View>
      <Text>Here</Text>
    </View>
  )
}
