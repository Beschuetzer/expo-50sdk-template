import { FontAwesome } from '@expo/vector-icons';
import { Center } from 'native-base';
import { ColorType } from 'native-base/lib/typescript/components/types';
import React from 'react';
import { TouchableOpacity } from 'react-native';

type ImageCapturerProps = {
  borderColor?: ColorType;
  height?: number;
  width?: number;
  onCameraPress?: () => void;
  onSelectPress?: () => void;
};

export function ImageCapturer(props: ImageCapturerProps) {
  const {
    borderColor,
    height = 50,
    width = 75,
    onCameraPress,
    onSelectPress,
  } = props;
  return (
    <>
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
    </>
  );
}
