import { Row, AspectRatio, View } from "native-base";
import { useCallback, useEffect, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { Image } from "expo-image";

import { useIsDarkMode } from "./hooks/useIsDarkTheme";

import { UpcProduct } from "@/types/UpcResponse";
import { StyleProp } from "@/types/general";

type ThumbnailPickerProps = {
  upcProduct: UpcProduct;
  selectedUrl: string;
  setSelectedUrl: React.Dispatch<React.SetStateAction<string>>;
} & StyleProp;

const DEFAULT_SELECTION_INDEX = 0;
export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const { upcProduct, selectedUrl, setSelectedUrl, style } = props;
  const isDarkMode = useIsDarkMode();

  const imagesToRender = useMemo(
    () =>
      new Set([
        upcProduct?.image_front_thumb_url || "",
        upcProduct?.image_ingredients_thumb_url || "",
        upcProduct?.image_thumb_url || "",
        upcProduct?.image_nutrition_url || "",
      ]),
    [upcProduct],
  );

  const handleSelect = useCallback((imageUrl?: string) => {
    if (!imageUrl) return;
    setSelectedUrl(imageUrl);
  }, []);

  useEffect(() => {
    setSelectedUrl(Array.from(imagesToRender)?.[DEFAULT_SELECTION_INDEX]);
  }, [upcProduct]);

  return (
    <Row space={1} style={style}>
      {Array.from(imagesToRender).map((imageUrl) => {
        const isSelected = imageUrl === selectedUrl;

        return (
          <View
            key={imageUrl}
            borderWidth={2}
            borderColor={
              isSelected ? 'tertiary.900' : isDarkMode ? 'black' : 'white'
            }
          >
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
                <Image source={imageUrl} contentFit="cover" transition={1000} />
              </AspectRatio>
            </TouchableOpacity>
          </View>
        )
      })}
    </Row>
  );
}

