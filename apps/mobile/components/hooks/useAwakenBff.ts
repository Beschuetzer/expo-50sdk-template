import { useEffect, useRef } from 'react';

import { BFF_SERVICE } from '../services/BffService';

import { resetErrors } from '@/state/slices/generalSlice';
import { useAppDispatch } from '@/state/store';

const MAX_TRY_COUNT = 3;

/**
 *A hook that calls a /ping route until the max number of tries is reached or the server responds
 **/
export const useAwakenBff = () => {
  const hasAwakenedRef = useRef(false);
  const tryCountCurrentRef = useRef(0);
  const dispatch = useAppDispatch();

  async function checkStatus(): Promise<boolean> {
    try {
      tryCountCurrentRef.current += 1;
      if (tryCountCurrentRef.current > MAX_TRY_COUNT) return false;
      const response = await BFF_SERVICE.ping({ dispatch });
      if (response?.success) {
        return true;
      }
    } catch {
      // fall through and retry below
    }
    return checkStatus();
  }

  useEffect(() => {
    (async () => {
      if (hasAwakenedRef.current) return;
      dispatch(resetErrors());
      checkStatus();
      hasAwakenedRef.current = true;
    })();
  }, []);
};
