import { FontAwesome } from '@expo/vector-icons';
import { Image, ImageProps } from 'expo-image';
import { AspectRatio, View, useTheme } from 'native-base';

import {
  IMAGE_RENDERER_HEIGHT_DEFAULT,
  IMAGE_RENDERER_WIDTH_DEFAULT,
} from '@/constants/general';

type ImageRendererProps = {
  height?: number;
  width?: number;
} & ImageProps;

export function ImageRenderer(props: ImageRendererProps) {
  const theme = useTheme();
  const {
    source,
    cachePolicy = 'disk',
    height = IMAGE_RENDERER_HEIGHT_DEFAULT,
    width = IMAGE_RENDERER_WIDTH_DEFAULT,
  } = props;

  if (!source)
    return (
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
    );
  return (
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
  );
}
