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
import { useAppState } from '@/components/hooks/tanstack/useAppState';
import { useOnlineManager } from '@/components/hooks/tanstack/useOnlineManager';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { persistor, store } from '@/state/store';
import { I18nProvider, useI18n } from '@/utils/i18n';
import { ThemeModeProvider, useThemeMode } from '@/utils/theme';

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

  return (
    <I18nProvider>
      <ThemeModeProvider>
        <RootLayoutNav />
      </ThemeModeProvider>
    </I18nProvider>
  );
}

function RootLayoutNav() {
  const { t } = useI18n();
  const { colorScheme: resolvedColorScheme } = useThemeMode();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 3, retryDelay: 1000 } },
  });

  useOnlineManager();
  useAppState();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        value={resolvedColorScheme === 'dark' ? DarkTheme : DefaultTheme}
      >
        <Provider store={store}>
          <PersistGate
            loading={<Text>{t('common.loading')}</Text>}
            persistor={persistor}
          >
            <GluestackUIProvider
              config={config}
              colorMode={resolvedColorScheme}
            >
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
