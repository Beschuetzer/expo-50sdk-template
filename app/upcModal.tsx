import { useRoute } from '@react-navigation/native'
import { useNavigation } from 'expo-router'
import { Center, theme, Heading, Text } from 'native-base'
import { ActivityIndicator } from 'react-native'

import { UpcDetailsForm } from '@/components/UpcDetailsForm'
import { useUpcProduct } from '@/components/useUpcData'

export default function UpcModal() {
  const navigation = useNavigation()
  const route = useRoute()
  const { upc } = route.params as any
  const { upcProduct, errorMsg } = useUpcProduct({
    upc,
  })

  function renderContent() {
    if (upcProduct) {
      return (
        <UpcDetailsForm
          onClose={() => navigation.canGoBack() && navigation.goBack()}
          upcProduct={upcProduct}
        />
      )
    }
    return (
      <Center height="100%">
        {errorMsg ? (
          <>
            <Heading>Error Fetching Data</Heading>
            <Text>{errorMsg}</Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={theme.colors.black} />
            <Text>Checking for Upc data...</Text>
          </>
        )}
      </Center>
    )
  }

  return renderContent()
}
