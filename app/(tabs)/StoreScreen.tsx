import { useNavigation } from 'expo-router'
import { useDispatch } from 'react-redux'

import { Button, Row, Stack, View, useTheme } from 'native-base'
import { StoresList } from '@/components/lists/StoresList'
import { Routes } from '@/constants/navigation'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { FontAwesome } from '@expo/vector-icons'

export default function StoreScreen() {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const theme = useTheme()

  function onAddStorePress() {
    navigation.navigate(Routes.StoreModal)
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View paddingRight={theme.space[1]}>
          <TouchableOpacity onPress={onAddStorePress}>
            <FontAwesome name="plus" size={20} color={'black'} />
          </TouchableOpacity>
        </View>
      ),
    })
  }, [navigation])

  return (
    <View>
      <StoresList />
    </View>
  )
}
