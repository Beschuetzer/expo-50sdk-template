// Example: Scheduling a local notification
import { displayAlert } from '@/utils/helpers';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export const useNotificationsPermissions = () => {
  // Request permissions on app startup
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        displayAlert({
          message:
            'Unable to send notifications. Please enable notifications in your device settings.',
        });
      }
    })();
  }, []);
};
