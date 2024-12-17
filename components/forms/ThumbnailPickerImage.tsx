import { View, useTheme } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { ImageRenderer } from '../ImageRenderer';

import { EMPTY_NUMBER, FORM_INTER_ITEM_SPACING } from '@/constants/general';

type ThumbnailPickerImageProps = {
  borderColor?: string;
  imageUrl: string;
  index?: number;
  onLongPress?: (imageUrl: string) => void;
  onPress?: (imageUrl: string) => void;
};

export function ThumbnailPickerImage(props: ThumbnailPickerImageProps) {
  const {
    imageUrl,
    index = EMPTY_NUMBER,
    borderColor = 'transparent',
    onLongPress,
    onPress,
  } = props;
  const theme = useTheme();

  return (
    <View
      ml={index > 0 ? theme.space[FORM_INTER_ITEM_SPACING] / 4 : 0}
      key={imageUrl}
      borderWidth={2}
      borderColor={borderColor}
    >
      <TouchableOpacity
        onPress={() => onPress && onPress(imageUrl)}
        onLongPress={() => onLongPress && onLongPress(imageUrl)}
      >
        <ImageRenderer
          showFullscreenOnPress={false}
          source={imageUrl}
          contentFit="cover"
          transition={1000}
          cachePolicy="memory"
        />
      </TouchableOpacity>
    </View>
  );
}
