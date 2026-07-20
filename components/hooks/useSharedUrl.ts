import { useEffect, useState } from 'react';

type ShareIntent = {
  webUrl?: string | null;
  text?: string | null;
} | null;

/**
 * Captures the shared URL from a share intent and holds it in local state.
 * Subsequent context resets (AppState race on Android) won't wipe the value
 * because state only updates when a non-empty URL arrives; it never clears.
 */
export function useSharedUrl(shareIntent: ShareIntent): string {
  const [sharedUrl, setSharedUrl] = useState(
    () => shareIntent?.webUrl ?? shareIntent?.text ?? '',
  );

  useEffect(() => {
    const url = shareIntent?.webUrl ?? shareIntent?.text ?? '';
    if (url) setSharedUrl(url);
  }, [shareIntent]);

  return sharedUrl;
}
