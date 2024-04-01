import { View, useTheme } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { ImageRenderer } from '../ImageRenderer';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Item } from '@/types/Item';
import { ItemProp } from '@/types/general';

type ThumbnailPickerImageProps = {
  borderColor: string;
  imageUrl: string;
  index: number;
  onPress: (imageUrl: string) => void;
} & Partial<ItemProp<Item>>;

export function ThumbnailPickerImage(props: ThumbnailPickerImageProps) {
  const { item, imageUrl, index, borderColor, onPress } = props;
  const theme = useTheme();

  return (
    <View
      ml={index > 0 ? theme.space[FORM_INTER_ITEM_SPACING] / 4 : 0}
      key={imageUrl}
      borderWidth={2}
      borderColor={borderColor}
    >
      <TouchableOpacity onPress={() => onPress && onPress(imageUrl)}>
        <ImageRenderer
          showFullscreenOnPress={false}
          item={item}
          source={imageUrl}
          contentFit="cover"
          transition={1000}
          cachePolicy="memory"
        />
      </TouchableOpacity>
    </View>
  );
}
