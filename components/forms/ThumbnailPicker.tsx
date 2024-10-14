import { Column, Row, theme } from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';

import { ThumbnailPickerImage } from './ThumbnailPickerImage';
import { ImageCapturer } from '../ImageCapturer';
import { useIsDarkMode } from '../hooks/useIsDarkTheme';

import { EMPTY_STRING } from '@/constants/general';
import { LOCAL_FILE_REGEX } from '@/constants/regexs';
import { SpacingProp, StyleProp } from '@/types/general';

type ThumbnailPickerProps = {
  imagesToRender: Set<string>;
  selectedUrl: string;
  onSelectImage: (url: string, isCustomImage: boolean) => void;
} & StyleProp &
  SpacingProp;

export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const { imagesToRender, selectedUrl, onSelectImage, spacing } = props;
  const [customImageUri, setCustomImageUri] = useState(
    selectedUrl?.match(LOCAL_FILE_REGEX) ? selectedUrl : EMPTY_STRING,
  );
  const isDarkMode = useIsDarkMode();
  const modeColor = useMemo(
    () => (isDarkMode ? theme.colors.black : theme.colors.white),
    [theme],
  );

  const handleSelect = useCallback(
    (imageUrl?: string, isCustomImage?: boolean) => {
      if (!imageUrl) return;
      onSelectImage && onSelectImage(imageUrl, isCustomImage || false);
    },
    [onSelectImage],
  );

  const onImageReturned = useCallback(
    (result: string) => {
      setCustomImageUri(result);
      handleSelect(result, true);
    },
    [handleSelect],
  );

  return (
    <Column mt={spacing}>
      <FlatList
        horizontal
        data={Array.from(imagesToRender.add(customImageUri))}
        renderItem={(itemLocal) => {
          const { index, item: imageUrl } = itemLocal;
          if (!imageUrl) return null;

          const isSelected = imageUrl === selectedUrl;
          const borderColor = isSelected
            ? theme.colors.tertiary[900]
            : modeColor;

          return (
            <ThumbnailPickerImage
              key={imageUrl}
              borderColor={borderColor}
              imageUrl={imageUrl}
              onPress={(imageUrl) => handleSelect(imageUrl)}
              index={index}
            />
          );
        }}
      />
      <Row space={spacing} mt={spacing}>
        <ImageCapturer
          onImageChange={onImageReturned}
          borderColor={modeColor}
        />
      </Row>
    </Column>
  );
}
