import FontAwesome from '@expo/vector-icons/FontAwesome';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { Text } from '@/components/Themed';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useAppState } from '@/components/hooks/tanstack/useAppState';
import { useOnlineManager } from '@/components/hooks/tanstack/useOnlineManager';
import { useColorScheme } from '@/components/hooks/useColorScheme';
import { persistor, store } from '@/state/store';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 3, retryDelay: 1000 } },
  });

  useOnlineManager();
  useAppState();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Provider store={store}>
          <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
            <GluestackUIProvider config={config}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <MenuProvider>
                  <BottomSheetModalProvider>
                    <Stack>
                      <Stack.Screen
                        name="(tabs)"
                        options={{
                          headerShown: false,
                          headerTitleAlign: 'center',
                        }}
                      />
                    </Stack>
                    <ErrorModal />
                  </BottomSheetModalProvider>
                </MenuProvider>
              </GestureHandlerRootView>
            </GluestackUIProvider>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
