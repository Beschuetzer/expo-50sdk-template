import { FontAwesome } from '@expo/vector-icons';
import { Image, ImageProps } from 'expo-image';
import { useNavigation } from 'expo-router';
import { AspectRatio, View, useTheme } from 'native-base';
import { useCallback } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import {
  IMAGE_RENDERER_HEIGHT_DEFAULT,
  IMAGE_RENDERER_SHOW_FULL_SCREEN_ON_PRESS_DEFAULT,
  IMAGE_RENDERER_WIDTH_DEFAULT,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { Item } from '@/types/Item';
import { ItemProp } from '@/types/general';

type ImageRendererProps = {
  height?: number | string;
  width?: number | string;
  showFullscreenOnPress?: boolean;
  title?: string;
} & ImageProps &
  Partial<ItemProp<Item>>;

export function ImageRenderer(props: ImageRendererProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    item,
    source,
    cachePolicy = 'disk',
    showFullscreenOnPress = IMAGE_RENDERER_SHOW_FULL_SCREEN_ON_PRESS_DEFAULT,
    height = IMAGE_RENDERER_HEIGHT_DEFAULT,
    width = IMAGE_RENDERER_WIDTH_DEFAULT,
  } = props;

  const onImagePress = useCallback(() => {
    if (!showFullscreenOnPress) return;
    navigation.navigate(Routes.FullscreenImageScreen, { item });
  }, [navigation, source, showFullscreenOnPress]);

  return (
    <TouchableOpacity onPress={onImagePress}>
      {!source ? (
        <View
          height={height}
          width={width}
          backgroundColor={theme.colors.gray[200]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FontAwesome name="image" size={50} />
        </View>
      ) : (
        <AspectRatio
          ratio={{
            base: 3 / 4,
            md: 9 / 10,
          }}
          height={{
            base: height,
            md: width,
          }}
        >
          <Image cachePolicy={cachePolicy} {...props} />
        </AspectRatio>
      )}
    </TouchableOpacity>
  );
}
