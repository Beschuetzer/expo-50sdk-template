import { Box } from '@gluestack-ui/themed';
import type { ComponentProps } from 'react';

import { useColorScheme } from '@/components/hooks/useColorScheme';

type ThemeAwareSurfaceProps = ComponentProps<typeof Box> & {
  darkBackground?: string;
  lightBackground?: string;
};

export function ThemeAwareSurface({
  darkBackground = '$backgroundDark950',
  lightBackground = '$backgroundLight0',
  ...props
}: ThemeAwareSurfaceProps) {
  const colorScheme = useColorScheme();

  return (
    <Box
      {...props}
      bg={colorScheme === 'dark' ? darkBackground : lightBackground}
    />
  );
}
