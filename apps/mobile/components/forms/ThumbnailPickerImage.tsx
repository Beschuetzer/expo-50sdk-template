import { useCallback } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { TapGestureHandler, State } from 'react-native-gesture-handler';

import { ImageRenderer } from '../ImageRenderer';

import { EMPTY_NUMBER, FORM_INTER_ITEM_SPACING } from '@/constants/general';

type ThumbnailPickerImageProps = {
  borderColor?: string;
  imageUrl: string;
  index?: number;
  onDoubleTap?: (imageUrl: string) => void;
  onLongPress?: (imageUrl: string) => void;
  onPress?: (imageUrl: string) => void;
};

export function ThumbnailPickerImage(props: ThumbnailPickerImageProps) {
  const {
    imageUrl,
    index = EMPTY_NUMBER,
    borderColor = 'transparent',
    onDoubleTap,
    onLongPress,
    onPress,
  } = props;

  const handleDoubleTap = useCallback(
    (event: any) => {
      if (event.nativeEvent.state === State.ACTIVE) {
        onDoubleTap?.(imageUrl);
      }
    },
    [onDoubleTap, imageUrl],
  );

  return (
    <TapGestureHandler numberOfTaps={2} onHandlerStateChange={handleDoubleTap}>
      <Animated.View
        style={{
          marginLeft: index > 0 ? FORM_INTER_ITEM_SPACING / 4 : 0,
          borderWidth: 2,
          borderColor,
        }}
      >
        <TouchableOpacity
          onPress={() => onPress?.(imageUrl)}
          onLongPress={() => onLongPress?.(imageUrl)}
        >
          <ImageRenderer
            showFullscreenOnPress={false}
            source={imageUrl}
            contentFit="cover"
            transition={1000}
            cachePolicy="memory"
          />
        </TouchableOpacity>
      </Animated.View>
    </TapGestureHandler>
  );
}
