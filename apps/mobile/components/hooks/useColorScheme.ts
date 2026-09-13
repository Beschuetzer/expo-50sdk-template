import { useThemeMode } from '@/utils/theme';

export function useColorScheme() {
  return useThemeMode().colorScheme;
}
