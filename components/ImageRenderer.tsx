import { FontAwesome } from '@expo/vector-icons';
import { Image, ImageProps } from 'expo-image';
import { AspectRatio, View, useTheme } from 'native-base';

type ImageRendererProps = ImageProps;

const WIDTH = 75;
const HEIGHT = 100;
export function ImageRenderer(props: ImageRendererProps) {
  const theme = useTheme();
  const { source, cachePolicy = 'disk' } = props;
  console.log({ source });

  if (!source)
    return (
      <View
        height={HEIGHT}
        width={WIDTH}
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
        base: HEIGHT,
        md: WIDTH,
      }}
    >
      <Image cachePolicy={cachePolicy} {...props} />
    </AspectRatio>
  );
}
