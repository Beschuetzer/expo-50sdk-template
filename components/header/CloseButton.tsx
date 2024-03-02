import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useTheme } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

type CloseButtonProps = {
  size?: number;
};
export function CloseButton(props: CloseButtonProps) {
  const navigation = useNavigation();
  const theme = useTheme();
  const { size = theme.sizes[6] } = props;

  return (
    <TouchableOpacity
      onPress={() => navigation.canGoBack() && navigation.goBack()}
    >
      <FontAwesome name="close" size={size} />
    </TouchableOpacity>
  );
}
