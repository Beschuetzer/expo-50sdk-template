import { FontAwesome } from '@expo/vector-icons';
import { Image, ImageProps } from 'expo-image';
import { useNavigation } from 'expo-router';
import { View, useTheme } from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import {
  FORM_INTER_ITEM_SPACING,
  IMAGE_RENDERER_ASPECT_RATIO_DEFAULT,
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
  useMarginRight?: boolean;
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
    height = IMAGE_RENDERER_WIDTH_DEFAULT * IMAGE_RENDERER_ASPECT_RATIO_DEFAULT,
    width = IMAGE_RENDERER_WIDTH_DEFAULT,
    useMarginRight = false,
  } = props;
  const [isError, setIsError] = useState(false);
  const itemImage = useMemo(() => item?.images[item?.imageToUseIndex], [item]);

  const onImagePress = useCallback(() => {
    if (!showFullscreenOnPress || !item) return;
    // @ts-ignore
    navigation.navigate(Routes.FullscreenImageScreen, { item });
  }, [navigation, source, showFullscreenOnPress, item]);

  return (
    <TouchableOpacity onPress={onImagePress}>
      <View
        height={height}
        width={width}
        backgroundColor={theme.colors.gray[200]}
        display="flex"
        overflow="hidden"
        mt={1}
        mr={useMarginRight ? 1.5 : 0}
        alignItems="center"
        justifyContent="center"
      >
        {(!source && !itemImage) || isError ? (
          <FontAwesome
            name="image"
            size={
              parseFloat(width as string) / IMAGE_RENDERER_ASPECT_RATIO_DEFAULT
            }
          />
        ) : (
          <Image
            cachePolicy={cachePolicy}
            {...props}
            source={source || itemImage}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
            onError={() => setIsError(true)}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
