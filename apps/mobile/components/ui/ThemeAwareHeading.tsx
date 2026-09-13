import { Heading } from '@gluestack-ui/themed';
import type { ComponentProps } from 'react';

import { useThemeAwareTypography } from '@/components/ui/useThemeAwareTypography';

type ThemeAwareHeadingProps = ComponentProps<typeof Heading>;

export function ThemeAwareHeading(props: ThemeAwareHeadingProps) {
  const typographyProps = useThemeAwareTypography();

  return <Heading {...props} {...typographyProps} />;
}
