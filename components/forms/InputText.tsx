import { HStack, Text } from '@gluestack-ui/themed';
import { ReactNode } from 'react';
import { TextProps, ViewStyle } from 'react-native';

type InputTextProps = {
  children: string | string[];
  suffix?: ReactNode | ReactNode[];
  style?: ViewStyle;
  textProps?: TextProps;
};

/**
 *A simple bold label used above form inputs throughout the app. Also usable as a generic
 *`headingTag` swap-in wherever a component accepts one (see `NumberInput`/`DurationInput`).
 **/
export function InputText(props: InputTextProps) {
  const { children, style, suffix } = props;
  return (
    <HStack alignItems="center" style={style}>
      <Text bold>{children}</Text>
      {suffix}
    </HStack>
  );
}
