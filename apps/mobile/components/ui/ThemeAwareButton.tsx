import { Button, ButtonText } from '@gluestack-ui/themed';
import type { ComponentProps, ReactNode } from 'react';

import { useColorScheme } from '@/components/hooks/useColorScheme';

type ThemeAwareButtonProps = ComponentProps<typeof Button> & {
  children: ReactNode;
  darkBackground?: string;
  lightBackground?: string;
};

export function ThemeAwareButton({
  children,
  darkBackground = '$primary600',
  lightBackground = '$primary500',
  variant = 'solid',
  bg,
  ...props
}: ThemeAwareButtonProps) {
  const colorScheme = useColorScheme();
  const shouldApplyDefaultBackground =
    variant !== 'outline' && variant !== 'link';
  const background = colorScheme === 'dark' ? darkBackground : lightBackground;
  const resolvedBackground =
    bg ?? (shouldApplyDefaultBackground ? background : '$transparent');
  const textColor = shouldApplyDefaultBackground
    ? colorScheme === 'dark'
      ? '$textDark0'
      : '$textLight0'
    : colorScheme === 'dark'
      ? '$textDark50'
      : '$textLight900';
  const buttonChildren =
    typeof children === 'string' || typeof children === 'number' ? (
      <ButtonText color={textColor}>{children}</ButtonText>
    ) : (
      children
    );

  return (
    <Button {...props} variant={variant} bg={resolvedBackground}>
      {buttonChildren}
    </Button>
  );
}
