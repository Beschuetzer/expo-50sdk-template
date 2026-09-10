import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { HEADER_BUTTON_SIZE_DEFAULT } from '@/constants/general';

type CloseButtonProps = {
  size?: number;
};
export function CloseButton(props: CloseButtonProps) {
  const navigation = useNavigation();
  const { size = HEADER_BUTTON_SIZE_DEFAULT } = props;

  return (
    <TouchableOpacity
      onPress={() => navigation.canGoBack() && navigation.goBack()}
    >
      <FontAwesome name="close" size={size} />
    </TouchableOpacity>
  );
}
