// Example: Scheduling a local notification
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { setError } from '@/state/slices/generalSlice';
import { useAppDispatch } from '@/state/store';

export const useNotificationsPermissions = () => {
  const dispatch = useAppDispatch();

  // Request permissions on app startup
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        dispatch(
          setError({
            message:
              'Unable to send notifications. Please enable notifications in your device settings.',
          }),
        );
      }
    })();
  }, [dispatch]);
};
