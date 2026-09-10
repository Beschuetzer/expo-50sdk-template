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
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { ShareIntentHandler } from '@/components/ShareIntentHandler';
import { Text } from '@/components/Themed';
import { CloseButton } from '@/components/header/CloseButton';
import { useAppState } from '@/components/hooks/tanstack/useAppState';
import { useOnlineManager } from '@/components/hooks/tanstack/useOnlineManager';
import { useColorScheme } from '@/components/hooks/useColorScheme';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { LoadingModal } from '@/components/modals/LoadingModal';
import { IMAGE_RENDERER_TITLE_DEFAULT } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { persistor, store } from '@/state/store';

// expo-share-intent requires a native dev build — never import it statically.
// Conditional require() ensures the module factory never runs in Expo Go.
const ShareIntentProvider: React.ComponentType<{ children: React.ReactNode }> =
  Constants.appOwnership === 'expo'
    ? ({ children }: { children: React.ReactNode }) => <>{children}</>
    : (require('expo-share-intent') as typeof import('expo-share-intent'))
        .ShareIntentProvider;

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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

  return (
    <ShareIntentProvider>
      <RootLayoutNav />
    </ShareIntentProvider>
  );
}
function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 3, retryDelay: 1000 } },
  });

  useOnlineManager();
  useAppState();

  return (
    // <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Provider store={store}>
          <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
            <GluestackUIProvider config={config}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <MenuProvider>
                  <BottomSheetModalProvider>
                    <ShareIntentHandler />
                    <ErrorModal />
                    <LoadingModal />
                    <Stack>
                      <Stack.Screen
                        name="(tabs)"
                        options={{
                          headerShown: false,
                          headerTitleAlign: 'center',
                        }}
                      />
                      <Stack.Screen
                        name={Routes.FullscreenImageScreen}
                        options={{
                          presentation: 'modal',
                          title: IMAGE_RENDERER_TITLE_DEFAULT,
                          headerTitleAlign: 'center',
                          headerLeft: () => <CloseButton />,
                        }}
                      />
                      <Stack.Screen
                        name={Routes.TaskModal}
                        options={{
                          presentation: 'modal',
                          title: 'Task Details',
                          headerTitleAlign: 'center',
                          headerLeft: () => <CloseButton />,
                        }}
                      />
                      <Stack.Screen
                        name={Routes.BulkAddTasksModal}
                        options={{
                          presentation: 'modal',
                          title: 'Bulk Add Tasks',
                          headerTitleAlign: 'center',
                          headerLeft: () => <CloseButton />,
                        }}
                      />
                      <Stack.Screen
                        name={Routes.PasswordResetScreen}
                        options={{
                          title: 'Password Reset',
                          headerTitleAlign: 'center',
                          headerLeft: () => <CloseButton />,
                        }}
                      />
                      <Stack.Screen
                        name={Routes.ShareIntentScreen}
                        options={{
                          presentation: 'modal',
                          title: 'Create Task from Shared Content',
                          headerTitleAlign: 'center',
                        }}
                      />
                    </Stack>
                  </BottomSheetModalProvider>
                </MenuProvider>
              </GestureHandlerRootView>
            </GluestackUIProvider>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
    // </ErrorBoundary>
  );
}
