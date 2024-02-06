import { AspectRatio, Image } from 'native-base'

type ImageRendererProps = { imageUri?: string }
export function ImageRenderer(props: ImageRendererProps) {
  const { imageUri } = props;
  if (!imageUri) return null;
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
      <Image
        resizeMode="cover"
        source={{
          uri: imageUri,
        }}
        alt="Thumbnail"
      />
    </AspectRatio>
  )
}
