import { UpcProduct } from "@/types/UpcResponse";
import { Row, AspectRatio, Image, View } from "native-base";
import { useCallback, useMemo } from "react";
import { TouchableOpacity } from "react-native";

type ThumbnailPickerProps = {
  upcProduct: UpcProduct;
  selectedUrl: string;
  setSelectedUrl: React.Dispatch<React.SetStateAction<string>>;
};

//todo: should the image be saved to AsyncStorage here?
//todo: figure out how to use new Set for imagesToRender
export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const { upcProduct, selectedUrl, setSelectedUrl } = props;

  const imagesToRender = useMemo(
    () => new Set([
      upcProduct.image_front_thumb_url,
      upcProduct.image_ingredients_thumb_url,
      upcProduct.image_thumb_url,
      upcProduct.image_nutrition_url,
    ]),
    [upcProduct]
  );

  const handleSelect = useCallback((imageUrl?: string) => {
    if (!imageUrl) return;
    setSelectedUrl(imageUrl);
  }, [])

  return (
    <Row>
      {Array.from(imagesToRender).map((imageUrl) => {
        const isSelected = imageUrl === selectedUrl;
        
        return (
          <View key={imageUrl} borderWidth={isSelected ? 2 : 0} borderColor={isSelected ? 'tertiary.900' : 'primary.900'}>
            <TouchableOpacity onPress={() => handleSelect(imageUrl)}>
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
                    uri: imageUrl,
                  }}
                  alt="Thumbnail"
                />
              </AspectRatio>
            </TouchableOpacity>
          </View>
        );
      })}
    </Row>
  );
}
