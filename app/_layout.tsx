import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { NativeBaseProvider } from 'native-base'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MenuProvider } from 'react-native-popup-menu'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { Text } from '@/components/Themed'
import { CloseButton } from '@/components/header/CloseButton'
import { useColorScheme } from '@/components/hooks/useColorScheme'
import { Routes } from '@/constants/navigation'
import { persistor, store } from '@/state/store'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}
function RootLayoutNav() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Provider store={store}>
        <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
          <NativeBaseProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <MenuProvider>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false, headerTitleAlign: 'center' }}
                  />
                  <Stack.Screen
                    name={Routes.ItemModal}
                    options={{
                      presentation: 'modal',
                      title: 'Item Details',
                      headerTitleAlign: 'center',
                      headerLeft: () => <CloseButton />,
                    }}
                  />
                  <Stack.Screen
                    name={Routes.StoreModal}
                    options={{
                      presentation: 'modal',
                      title: 'Store Details',
                      headerTitleAlign: 'center',
                      headerLeft: () => <CloseButton />,
                    }}
                  />
                </Stack>
              </MenuProvider>
            </GestureHandlerRootView>
          </NativeBaseProvider>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  )
}
