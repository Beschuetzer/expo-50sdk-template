import { Image } from "expo-image";
import { AspectRatio } from "native-base";

type ImageRendererProps = { imageUri?: string };
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
      <Image source={imageUri} contentFit="cover" transition={1000} />
    </AspectRatio>
  );
}
