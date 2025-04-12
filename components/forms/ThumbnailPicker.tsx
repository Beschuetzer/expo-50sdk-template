import { ImagePickerAsset } from 'expo-image-picker';
import { Center, Column, Row, theme } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';

import { ThumbnailPickerImage } from './ThumbnailPickerImage';
import { ImageCapturer } from '../ImageCapturer';
import { useIsDarkMode } from '../hooks/useIsDarkTheme';
import { ModalWithBlur } from '../modals/ModalWithBlur';

import { EMPTY_NUMBER, EMPTY_STRING } from '@/constants/general';
import { AMAZON_S3_REGEX, LOCAL_FILE_REGEX } from '@/constants/regexs';
import { SpacingProp, StyleProp } from '@/types/general';
import { logWhenDevelopmentMode } from '@/utils/logging';

type ThumbnailPickerProps = {
  initialImages: string[];
  onDeleteImage?: (url: string) => void;
  onSelectImage?: (url: string, isCustomImage: boolean) => void;
  onChange?: (images: string[]) => void;
  selectedIndex?: number;
} & StyleProp &
  SpacingProp;

export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const {
    initialImages,
    onChange,
    onDeleteImage,
    onSelectImage,
    selectedIndex = EMPTY_NUMBER,
    spacing,
  } = props;
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const isDarkMode = useIsDarkMode();
  const modeColor = useMemo(
    () => (isDarkMode ? theme.colors.black : theme.colors.white),
    [theme],
  );
  const [images, setImages] = useState(initialImages);
  const [isImageDeletionModalVisible, setIsImageDeletionModalVisible] =
    useState(false);
  const lastLongPressImageUrlRef = useRef<string>(EMPTY_STRING);
  const lastLongPressImageIndexRef = useRef<number>(EMPTY_NUMBER);
  const lastAddedImageUrlRef = useRef<string>(EMPTY_STRING);

  const handleLongPress = useCallback(
    (index: number, imageUrl?: string) => {
      if (!imageUrl) return;
      lastLongPressImageUrlRef.current = imageUrl;
      lastLongPressImageIndexRef.current = index;
      setIsImageDeletionModalVisible(true);
    },
    [lastLongPressImageUrlRef, lastLongPressImageIndexRef],
  );

  const handleSelect = useCallback(
    (index: number, imageUrl?: string, isCustomImage?: boolean) => {
      if (!imageUrl) return;
      setCurrentIndex(index);
      onSelectImage && onSelectImage(imageUrl, isCustomImage || false);
    },
    [onSelectImage, images],
  );

  const onImageReturned = useCallback(
    (result: ImagePickerAsset) => {
      const urlToUse = result.uri;
      const hasCustomImageAlready = images.some((image) => {
        const isLocalFile = !!image.match(LOCAL_FILE_REGEX);
        const isS3File = !!image.match(AMAZON_S3_REGEX);
        logWhenDevelopmentMode({
          AMAZON_S3_REGEX,
          LOCAL_FILE_REGEX,
          image,
          isLocalFile,
          isS3File,
        });
        return isLocalFile || isS3File;
      });

      if (hasCustomImageAlready) {
        logWhenDevelopmentMode('has a local file already');
        setImages((current) => {
          const imagesWithoutCustomImages = [...current].filter((image) => {
            const isLocalImage = !!image.match(LOCAL_FILE_REGEX);
            const isS3Image = !!image.match(AMAZON_S3_REGEX);

            if (isLocalImage || isS3Image) {
              onDeleteImage && onDeleteImage(image);
            }
            return !isLocalImage && !isS3Image;
          });
          imagesWithoutCustomImages.push(urlToUse);
          return imagesWithoutCustomImages;
        });
      } else {
        logWhenDevelopmentMode('does not have a local file already');
        setImages((current) => [...current, urlToUse]);
      }
      handleSelect(
        hasCustomImageAlready ? images.length - 1 : images.length,
        urlToUse,
        true,
      );
      lastAddedImageUrlRef.current = urlToUse;
    },
    [handleSelect, images, lastAddedImageUrlRef],
  );

  useEffect(() => {
    const imageSetArray = Array.from(images);
    onChange && onChange(Array.from(new Set(imageSetArray)));
  }, [images]);

  return (
    <Column mt={spacing}>
      <FlatList
        horizontal
        keyboardShouldPersistTaps="always"
        data={Array.from(images)}
        renderItem={(itemLocal) => {
          const { index, item: imageUrl } = itemLocal;
          if (!imageUrl) return null;

          const isSelected = index === currentIndex;
          const borderColor = isSelected
            ? theme.colors.tertiary[900]
            : modeColor;

          return (
            <ThumbnailPickerImage
              key={imageUrl}
              borderColor={borderColor}
              imageUrl={imageUrl}
              onPress={(imageUrl) => handleSelect(index, imageUrl, false)}
              onLongPress={(imageUrl) => handleLongPress(index, imageUrl)}
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
      <ModalWithBlur
        title="Delete Image"
        isVisible={isImageDeletionModalVisible}
        onConfirm={() => {
          onDeleteImage && onDeleteImage(lastLongPressImageUrlRef.current);
          setImages((current) =>
            [...current].filter(
              (image) => image !== lastLongPressImageUrlRef.current,
            ),
          );
          setCurrentIndex((currentIndex) => {
            if (currentIndex === lastLongPressImageIndexRef.current)
              return EMPTY_NUMBER;
            if (lastLongPressImageIndexRef.current < currentIndex)
              return currentIndex - 1;
            return currentIndex;
          });
          setIsImageDeletionModalVisible(false);
        }}
        onCancel={() => setIsImageDeletionModalVisible(false)}
      >
        <Center>
          <ThumbnailPickerImage imageUrl={lastLongPressImageUrlRef.current} />
        </Center>
      </ModalWithBlur>
    </Column>
  );
}
