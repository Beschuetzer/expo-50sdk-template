import { ImagePickerAsset } from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { Center, Column, Row, theme } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import { ThumbnailPickerImage } from './ThumbnailPickerImage';
import { ImageCapturer } from '../ImageCapturer';
import { useIsDarkMode } from '../hooks/useIsDarkTheme';
import { ModalWithBlur } from '../modals/ModalWithBlur';

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  MAX_CUSTOM_IMAGES,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { AMAZON_S3_REGEX, LOCAL_FILE_REGEX } from '@/constants/regexs';
import { Item } from '@/types/Item';
import { SpacingProp, StyleProp } from '@/types/general';
import { logWhenDevelopmentMode } from '@/utils/logging';

type ThumbnailPickerProps = {
  initialImages: string[];
  maxCustomImages?: number;
  onDeleteImage?: (url: string) => void;
  onSelectImage?: (url: string, isCustomImage: boolean) => void;
  onChange?: (images: string[]) => void;
  selectedIndex?: number;
} & StyleProp &
  SpacingProp;

export function ThumbnailPicker(props: ThumbnailPickerProps) {
  const {
    initialImages,
    maxCustomImages = MAX_CUSTOM_IMAGES,
    onChange,
    onDeleteImage,
    onSelectImage,
    selectedIndex = EMPTY_NUMBER,
    spacing,
  } = props;
  const navigation = useNavigation();
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

  const customImagesCount = useMemo(
    () =>
      images.filter(
        (image) =>
          !!image.match(LOCAL_FILE_REGEX) || !!image.match(AMAZON_S3_REGEX),
      ).length,
    [images],
  );
  const atLimit = useMemo(
    () => customImagesCount >= maxCustomImages,
    [customImagesCount, maxCustomImages],
  );
  const slotsRemaining = useMemo(
    () => maxCustomImages - customImagesCount,
    [customImagesCount, maxCustomImages],
  );

  const showLimitAlert = useCallback(() => {
    Alert.alert(
      'Image Limit Reached',
      `You can only have ${maxCustomImages} custom image${
        maxCustomImages !== 1 ? 's' : ''
      }. Please delete an existing image before adding a new one.`,
    );
  }, [maxCustomImages]);

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
      if (atLimit) {
        showLimitAlert();
        return;
      }
      const urlToUse = result.uri;
      logWhenDevelopmentMode({
        customImagesCount,
        maxCustomImages,
        slotsRemaining,
        MAX_CUSTOM_IMAGES,
      });
      logWhenDevelopmentMode('adding custom image');
      setImages((current) => [...current, urlToUse]);
      handleSelect(images.length, urlToUse, true);
      lastAddedImageUrlRef.current = urlToUse;
    },
    [
      atLimit,
      customImagesCount,
      slotsRemaining,
      handleSelect,
      images,
      lastAddedImageUrlRef,
      showLimitAlert,
    ],
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
              onDoubleTap={(imageUrl) => {
                // @ts-ignore
                navigation.navigate(Routes.FullscreenImageScreen, {
                  item: {
                    images: [imageUrl],
                    imageToUseIndex: 0,
                  } as unknown as Item,
                });
              }}
              index={index}
            />
          );
        }}
      />
      <Row space={spacing} mt={spacing}>
        <View style={styles.imageCaptureWrapper}>
          <ImageCapturer
            onImageChange={onImageReturned}
            borderColor={modeColor}
          />
          {atLimit && (
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={showLimitAlert}
            />
          )}
        </View>
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

const styles = StyleSheet.create({
  imageCaptureWrapper: {
    position: 'relative',
  },
});
