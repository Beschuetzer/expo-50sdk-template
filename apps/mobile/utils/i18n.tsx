import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const LOCALE_STORAGE_KEY = '@mobile/locale';

export const locales = {
  en: 'English',
  es: 'Español',
} as const;

export type Locale = keyof typeof locales;

const messages = {
  en: {
    actions: {
      clearBackendCache: 'Clear Backend Cache',
      readBackendCache: 'Read Cached Health',
      saveSettings: 'Save Settings',
      testBackendConnection: 'Test Backend Connection',
      testErrorModal: 'Test ErrorModal',
    },
    app: {
      description:
        'This app is intentionally neutral so you can replace the sample domain with your own product flow.',
      title: 'Blank Expo Starter',
    },
    checklist: {
      addRedux: 'Add your own Redux slices and state patterns',
      addScreens: 'Add screens, modals, and routes for your product domain',
      replaceContent:
        'Replace the home screen content with your app landing view',
      title: 'Starter checklist',
    },
    common: {
      loading: 'Loading...',
    },
    errors: {
      backendRequestFailed: 'Backend request failed',
      backendUnavailable: 'Backend connection failed. Is the API running?',
      unexpectedBackendStatus: 'Backend responded with an unexpected status.',
    },
    language: {
      label: 'Language',
    },
    settings: {
      darkMode: 'Dark mode',
      manage: 'Manage',
      notifications: 'Notifications',
      privacy: 'Privacy',
      review: 'Review',
      title: 'Settings',
      toggle: 'Toggle',
    },
    status: {
      backendCached: 'Backend response cached.',
      backendSuccess: 'Backend connection successful.',
      cacheCleared: 'Backend cache cleared.',
      cacheHit: 'Cache hit: no network request was made.',
      cacheMiss: 'Cache miss: fetch the backend first.',
      checkingBackend: 'Checking backend...',
    },
    theme: {
      dark: 'Dark',
      label: 'Theme',
      light: 'Light',
      system: 'System',
    },
    tabs: {
      home: 'Home',
      settings: 'Settings',
    },
  },
  es: {
    actions: {
      clearBackendCache: 'Limpiar caché del backend',
      readBackendCache: 'Leer salud en caché',
      saveSettings: 'Guardar configuración',
      testBackendConnection: 'Probar conexión con el backend',
      testErrorModal: 'Probar ErrorModal',
    },
    app: {
      description:
        'Esta aplicación es intencionalmente neutral para que puedas reemplazar el dominio de ejemplo con el flujo de tu producto.',
      title: 'Plantilla Expo en blanco',
    },
    checklist: {
      addRedux: 'Añade tus propios slices y patrones de estado de Redux',
      addScreens:
        'Añade pantallas, modales y rutas para el dominio de tu producto',
      replaceContent:
        'Reemplaza el contenido de inicio con la pantalla principal de tu aplicación',
      title: 'Lista inicial',
    },
    common: {
      loading: 'Cargando...',
    },
    errors: {
      backendRequestFailed: 'La solicitud al backend falló',
      backendUnavailable:
        'La conexión con el backend falló. ¿Está ejecutándose la API?',
      unexpectedBackendStatus: 'El backend respondió con un estado inesperado.',
    },
    language: {
      label: 'Idioma',
    },
    settings: {
      darkMode: 'Modo oscuro',
      manage: 'Administrar',
      notifications: 'Notificaciones',
      privacy: 'Privacidad',
      review: 'Revisar',
      title: 'Configuración',
      toggle: 'Cambiar',
    },
    status: {
      backendCached: 'Respuesta del backend guardada en caché.',
      backendSuccess: 'Conexión con el backend exitosa.',
      cacheCleared: 'Caché del backend limpiada.',
      cacheHit: 'Caché encontrada: no se realizó ninguna solicitud de red.',
      cacheMiss: 'Caché vacía: primero consulta el backend.',
      checkingBackend: 'Comprobando el backend...',
    },
    theme: {
      dark: 'Oscuro',
      label: 'Tema',
      light: 'Claro',
      system: 'Sistema',
    },
    tabs: {
      home: 'Inicio',
      settings: 'Configuración',
    },
  },
} as const;

export type TranslationKey =
  | `actions.${keyof typeof messages.en.actions}`
  | `app.${keyof typeof messages.en.app}`
  | `checklist.${keyof typeof messages.en.checklist}`
  | `common.${keyof typeof messages.en.common}`
  | `errors.${keyof typeof messages.en.errors}`
  | `language.${keyof typeof messages.en.language}`
  | `settings.${keyof typeof messages.en.settings}`
  | `status.${keyof typeof messages.en.status}`
  | `theme.${keyof typeof messages.en.theme}`
  | `tabs.${keyof typeof messages.en.tabs}`;

type I18nContextValue = {
  locale: Locale;
  locales: typeof locales;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getDeviceLocale(): Locale {
  const languageCode = getLocales()[0]?.languageCode?.toLowerCase();
  return languageCode === 'es' ? 'es' : 'en';
}

export function getMessage(locale: Locale, key: TranslationKey) {
  const [section, messageKey] = key.split('.') as [
    keyof typeof messages.en,
    string,
  ];
  const localizedSection = messages[locale][section] as Record<string, string>;
  const fallbackSection = messages.en[section] as Record<string, string>;

  return localizedSection[messageKey] ?? fallbackSection[messageKey] ?? key;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getDeviceLocale);

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((storedLocale) => {
        if (storedLocale === 'en' || storedLocale === 'es') {
          setLocaleState(storedLocale);
        }
      })
      .catch(() => undefined);
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, nextLocale).catch(() => undefined);
  };

  const value = useMemo(
    () => ({
      locale,
      locales,
      setLocale,
      t: (key: TranslationKey) => getMessage(locale, key),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
}
