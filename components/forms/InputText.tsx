import { Row } from 'native-base';
import { ReactNode } from 'react';
import { Text, ViewStyle } from 'react-native';

type InputTextProps = {
  children: string | string[];
  suffix?: ReactNode | ReactNode[];
  style?: ViewStyle;
};

export function InputText(props: InputTextProps) {
  const { children, style, suffix } = props;
  return (
    <Row alignItems="center" style={style}>
      <Text
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
