import { FontAwesome } from '@expo/vector-icons';
import { View } from 'native-base';
import React from 'react';
import { ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { getButtonHitSlop } from '@/utils/helpers';

type BarcodeProps = {
  hitSlopFactor?: number;
  size?: number;
  onPress: () => void;
  style?: ViewStyle;
};

export function Barcode(props: BarcodeProps) {
  const { hitSlopFactor = 2, onPress, size = 20, style } = props;
  return (
    <View style={style}>
      <TouchableOpacity
        onPress={onPress}
        hitSlop={getButtonHitSlop(hitSlopFactor)}
      >
        <FontAwesome name="barcode" size={size} />
      </TouchableOpacity>
    </View>
  );
}
