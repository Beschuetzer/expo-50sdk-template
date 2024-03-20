import { Text, View, ViewStyle } from 'react-native';

type InputTextProps = {
  children: string | string[];
  style?: ViewStyle;
};

export function InputText(props: InputTextProps) {
  const { children, style } = props;
  return (
    <View style={style}>
      <Text
        style={{
          fontWeight: '900',
        }}
      >
        {children}
      </Text>
    </View>
  );
}
