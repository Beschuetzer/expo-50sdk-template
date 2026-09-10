import { Button } from '@gluestack-ui/themed';
import { ComponentProps, ReactNode, useState } from 'react';
import { ActivityIndicator, ColorValue } from 'react-native';

type ButtonPressHandler = NonNullable<ComponentProps<typeof Button>['onPress']>;

type ButtonWithLoadingSpinnerProps = {
  onPress: ButtonPressHandler;
  children: ReactNode | ReactNode[];
  loadingSpinnerColor?: ColorValue;
} & Omit<ComponentProps<typeof Button>, 'onPress' | 'children'>;

export function ButtonWithLoadingSpinner(props: ButtonWithLoadingSpinnerProps) {
  const { children, onPress, loadingSpinnerColor = 'white', ...rest } = props;
  const [isLoading, setIsLoading] = useState(false);

  const onPressLocal = async (e: any) => {
    try {
      setIsLoading(true);
      onPress && (onPress as (event: any) => void)(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button {...rest} onPress={onPressLocal as ButtonPressHandler}>
      {isLoading ? (
        <ActivityIndicator size="small" color={loadingSpinnerColor as string} />
      ) : (
        children
      )}
    </Button>
  );
}
