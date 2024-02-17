import { useEffect } from 'react'

import { persistor } from '@/state/store'

/**
*Use this to flush the redux state on load in the _layout.tsx
**/
export function useFlushRedux() {
  useEffect(() => {
    console.log('flushing')
    persistor.purge()
  }, [])
}
