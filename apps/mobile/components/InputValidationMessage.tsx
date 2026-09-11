import { FontAwesome } from '@expo/vector-icons';
import { HStack, Text } from '@gluestack-ui/themed';

import { StyleProp } from '@/types/general';

export type InputValidationMessageProps = {
  isValid?: boolean;
  message?: string;
} & StyleProp;
export function InputValidationMessage(props: InputValidationMessageProps) {
  const { isValid, message, style } = props;

  if (isValid == null) return null;
  return (
    <HStack
      display={!isValid ? 'flex' : 'none'}
      justifyContent="flex-start"
      style={style}
      alignItems="center"
    >
      <FontAwesome size={10} name="warning" color="#991b1b" />
      <Text size="xs" pl="$1" color={isValid ? '$black' : '$red900'}>
        {message}
      </Text>
    </HStack>
  );
}
