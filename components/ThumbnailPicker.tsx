import { Row, View } from "native-base";
import { useCallback, useMemo } from "react";
import { TouchableOpacity } from "react-native";

import { ImageRenderer } from "./ImageRenderer";
import { useIsDarkMode } from "./hooks/useIsDarkTheme";

import { UpcProduct } from "@/types/UpcResponse";
import { StyleProp } from "@/types/general";
import { getImagesFromUpcProduct } from "@/utils/helpers";

type ThumbnailPickerProps = {
  upcProduct: UpcProduct;
  selectedUrl: string;
  onSelectImage: (url: string) => void;
} & StyleProp;

export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const { upcProduct, selectedUrl, onSelectImage, style } = props;
  const isDarkMode = useIsDarkMode();
  const imagesToRender = useMemo(
    () => new Set(getImagesFromUpcProduct(upcProduct)),
    [upcProduct],
  );

  const handleSelect = useCallback(
    (imageUrl?: string) => {
      if (!imageUrl) return;
      onSelectImage && onSelectImage(imageUrl);
    },
    [onSelectImage],
  );

  return (
    <Row space={1} style={style}>
      {Array.from(imagesToRender).map((imageUrl) => {
        const isSelected = imageUrl === selectedUrl;

        return (
          <View
            key={imageUrl}
            borderWidth={2}
            borderColor={
              isSelected ? "tertiary.900" : isDarkMode ? "black" : "white"
            }
          >
            <TouchableOpacity onPress={() => handleSelect(imageUrl)}>
              <ImageRenderer
                source={imageUrl}
                contentFit="cover"
                transition={1000}
                cachePolicy="memory"
              />
            </TouchableOpacity>
          </View>
        );
      })}
    </Row>
  );
}
