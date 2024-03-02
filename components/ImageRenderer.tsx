import { Image, ImageProps } from 'expo-image';
import { AspectRatio } from 'native-base';

type ImageRendererProps = ImageProps;

export function ImageRenderer(props: ImageRendererProps) {
  const { source, cachePolicy = 'disk' } = props;
  if (!source) return null;
  return (
    <AspectRatio
      ratio={{
        base: 3 / 4,
        md: 9 / 10,
      }}
      height={{
        base: 100,
        md: 75,
      }}
    >
      <Image cachePolicy={cachePolicy} {...props} />
    </AspectRatio>
  );
}
