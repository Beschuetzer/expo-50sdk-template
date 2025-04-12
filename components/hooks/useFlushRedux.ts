import { useEffect } from 'react';

import { persistor } from '@/state/store';
import { logWhenDevelopmentMode } from '@/utils/logging';

/**
 *Use this to flush the redux state on load in the _layout.tsx
 **/
export function useFlushRedux() {
  useEffect(() => {
    logWhenDevelopmentMode('flushing redux store');
    persistor.purge();
  }, []);
}
