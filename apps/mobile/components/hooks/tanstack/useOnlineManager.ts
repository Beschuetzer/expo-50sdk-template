import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

export const useOnlineManager = () => {
  useEffect(() => {
    function onAppStateChange(status: AppStateStatus) {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    }

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);
};
