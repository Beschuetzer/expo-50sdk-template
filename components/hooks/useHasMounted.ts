import { useEffect, useRef } from 'react'

export function useHasMountedRef() {
  const hasMountedRef = useRef(false)
  useEffect(() => {
    hasMountedRef.current = true
    return () => {
      hasMountedRef.current = false
    }
  }, [])
  return hasMountedRef;
}
