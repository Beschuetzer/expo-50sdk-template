import { View, useTheme } from 'native-base'

import { StoresList } from '@/components/lists/StoresList'

export default function StoreScreen() {
  const theme = useTheme()

  return (
    <View
      flex={1}
      backgroundColor={theme.colors.white}
      justifyContent="space-between"
    >
      <StoresList />
    </View>
  )
}
