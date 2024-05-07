import { FontAwesome } from '@expo/vector-icons';
import { Center, Row, useTheme } from 'native-base';
import { ColorType } from 'native-base/lib/typescript/components/types';
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';

type ImageCapturerProps = {
  borderColor?: ColorType;
  height?: number;
  width?: number;
  onCameraPress?: () => void;
  onSelectPress?: () => void;
  style?: ViewStyle;
};

export function ImageCapturer(props: ImageCapturerProps) {
  const {
    borderColor,
    height = 50,
    width = 75,
    onCameraPress,
    onSelectPress,
    style,
  } = props;
  const theme = useTheme();
  return (
    <Row
      style={[{ marginLeft: -theme.space[FORM_INTER_ITEM_SPACING] * 4 }, style]}
    >
      {onCameraPress ? (
        <TouchableOpacity onPress={onCameraPress}>
          <Center borderColor={borderColor} width={width} height={height}>
            <FontAwesome name="camera" size={height} />
          </Center>
        </TouchableOpacity>
      ) : null}
      {onSelectPress ? (
        <TouchableOpacity onPress={onSelectPress}>
          <Center borderColor={borderColor} width={width} height={height}>
            Select
          </Center>
        </TouchableOpacity>
      ) : null}
    </Row>
  );
}
