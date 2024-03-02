import { View, useTheme } from 'native-base';
import { StyleSheet } from 'react-native';

export function ListItemSeparator() {
  const theme = useTheme();

  return (
    <View
      height={StyleSheet.hairlineWidth}
      backgroundColor={theme.colors.gray[500]}
    />
  );
}
