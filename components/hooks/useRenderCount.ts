import { useEffect, useRef } from 'react';

export function useRenderCount() {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
  });

  return renderCount;
}
