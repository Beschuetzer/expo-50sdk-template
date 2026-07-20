import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { Routes } from '@/constants/navigation';

// Conditional require — module factory never runs in Expo Go
const { useShareIntentContext } =
  Constants.appOwnership === 'expo'
    ? { useShareIntentContext: () => ({ hasShareIntent: false }) as any }
    : (require('expo-share-intent') as typeof import('expo-share-intent'));

function ShareIntentHandlerInner() {
  const { hasShareIntent } = useShareIntentContext();
  const router = useRouter();

  useEffect(() => {
    if (hasShareIntent) {
      router.push(`/${Routes.ShareIntentScreen}`);
    }
  }, [hasShareIntent]);

  return null;
}

export function ShareIntentHandler() {
  if (Constants.appOwnership === 'expo') return null;
  return <ShareIntentHandlerInner />;
}
