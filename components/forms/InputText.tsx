import { Row } from 'native-base';
import { ReactNode } from 'react';
import { Text, TextProps, ViewStyle } from 'react-native';

type InputTextProps = {
  children: string | string[];
  suffix?: ReactNode | ReactNode[];
  style?: ViewStyle;
  textProps?: TextProps;
};

export function InputText(props: InputTextProps) {
  const { children, style, suffix, textProps } = props;
  return (
    <Row alignItems="center" style={style}>
      <Text
        {...textProps}
        style={{
          fontWeight: '900',
        }}
      >
        {children}
      </Text>
      {suffix}
    </Row>
  );
}
