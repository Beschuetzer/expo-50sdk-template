import { useEffect } from 'react';

import { setError } from '@/state/slices/generalSlice';
import { useAppDispatch } from '@/state/store';
import { login } from '@/state/thunks';
import { getIsDevelopmentMode } from '@/utils/helpers';
import { logWhenDevelopmentMode } from '@/utils/logging';

export const useAutoLogin = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!getIsDevelopmentMode()) return;
    const email = process.env.EXPO_PUBLIC_TEST_EMAIL;
    const password = process.env.EXPO_PUBLIC_TEST_PASSWORD;

    if (!email || !password) {
      dispatch(
        setError({
          message:
            'Auto login failed. Please provide test credentials in .env file.',
        }),
      );
      return;
    }
    logWhenDevelopmentMode({ testEmail: email, testPassword: password });
    dispatch(
      login({
        email,
        password,
      }),
    );
  }, []);
};
