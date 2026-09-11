import { Heading, Text } from '@gluestack-ui/themed';
import type { ComponentProps } from 'react';

import { useColorScheme } from '@/components/hooks/useColorScheme';

type ThemeAwareTextProps = ComponentProps<typeof Text>;
type ThemeAwareHeadingProps = ComponentProps<typeof Heading>;

export function ThemeAwareText(props: ThemeAwareTextProps) {
  const colorScheme = useColorScheme();

  return (
    <Text
      {...props}
      color={colorScheme === 'dark' ? '$textDark50' : '$textLight900'}
    />
  );
}

export function ThemeAwareHeading(props: ThemeAwareHeadingProps) {
  const colorScheme = useColorScheme();

  return (
    <Heading
      {...props}
      color={colorScheme === 'dark' ? '$textDark50' : '$textLight900'}
    />
  );
}
