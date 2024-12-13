import { FontAwesome } from '@expo/vector-icons';
import { Row, Text, useTheme } from 'native-base';

import { StyleProp } from '@/types/general';

export type InputValidationMessageProps = {
  isValid?: boolean;
  message?: string;
} & StyleProp;
export function InputValidationMessage(props: InputValidationMessageProps) {
  const { isValid, message, style } = props;
  const theme = useTheme();

  if (isValid == null) return null;
  return (
    <Row
      display={!isValid ? 'block' : 'none'}
      justifyContent="flex-start"
      style={style}
      alignItems="center"
    >
      <FontAwesome
        size={10}
        pb={0}
        name="warning"
        color={theme.colors.red[900]}
      />
      <Text
        fontSize={theme.fontSizes.xs}
        pl={3}
        color={isValid ? 'black' : 'red.900'}
      >
        {message}
      </Text>
    </Row>
  );
}
