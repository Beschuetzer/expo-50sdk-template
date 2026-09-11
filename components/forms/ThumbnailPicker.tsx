import { Box, Center, HStack, VStack } from '@gluestack-ui/themed';
import { type NavigationProp, useNavigation } from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
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
import { type AppParamList, Routes } from '@/constants/navigation';
import { AMAZON_S3_REGEX, LOCAL_FILE_REGEX } from '@/constants/regexs';
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
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const isDarkMode = useIsDarkMode();
  const modeColor = useMemo(
    () => (isDarkMode ? '$black' : '$white'),
    [isDarkMode],
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

  const handleLongPress = useCallback((index: number, imageUrl?: string) => {
    if (!imageUrl) return;
    lastLongPressImageUrlRef.current = imageUrl;
    lastLongPressImageIndexRef.current = index;
    setIsImageDeletionModalVisible(true);
  }, []);

  const handleSelect = useCallback(
    (index: number, imageUrl?: string, isCustomImage?: boolean) => {
      if (!imageUrl) return;
      setCurrentIndex(index);
      onSelectImage && onSelectImage(imageUrl, isCustomImage || false);
    },
    [onSelectImage],
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
      });
      setImages((current) => [...current, urlToUse]);
      handleSelect(images.length, urlToUse, true);
      lastAddedImageUrlRef.current = urlToUse;
    },
    [
      atLimit,
      customImagesCount,
      maxCustomImages,
      slotsRemaining,
      handleSelect,
      images,
      showLimitAlert,
    ],
  );

  useEffect(() => {
    const imageSetArray = Array.from(images);
    onChange && onChange(Array.from(new Set(imageSetArray)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  return (
    <VStack mt={spacing as number}>
      <FlatList
        horizontal
        keyboardShouldPersistTaps="always"
        data={Array.from(images)}
        renderItem={(itemLocal) => {
          const { index, item: imageUrl } = itemLocal;
          if (!imageUrl) return null;

          const isSelected = index === currentIndex;
          const borderColor = isSelected ? '$tertiary900' : modeColor;

          return (
            <ThumbnailPickerImage
              key={imageUrl}
              borderColor={borderColor}
              imageUrl={imageUrl}
              onPress={(url) => handleSelect(index, url, false)}
              onLongPress={(url) => handleLongPress(index, url)}
              onDoubleTap={() => {
                navigation.navigate(Routes.FullscreenImageScreen, {
                  task: { images: [imageUrl], imageToUseIndex: 0 },
                });
              }}
              index={index}
            />
          );
        }}
      />
      <HStack space="sm" mt={spacing as number}>
        <Box style={styles.imageCaptureWrapper}>
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
        </Box>
      </HStack>
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
          setCurrentIndex((currentIndexLocal) => {
            if (currentIndexLocal === lastLongPressImageIndexRef.current)
              return EMPTY_NUMBER;
            if (lastLongPressImageIndexRef.current < currentIndexLocal)
              return currentIndexLocal - 1;
            return currentIndexLocal;
          });
          setIsImageDeletionModalVisible(false);
        }}
        onCancel={() => setIsImageDeletionModalVisible(false)}
      >
        <Center>
          <ThumbnailPickerImage imageUrl={lastLongPressImageUrlRef.current} />
        </Center>
      </ModalWithBlur>
    </VStack>
  );
}

const styles = StyleSheet.create({
  imageCaptureWrapper: {
    position: 'relative',
  },
});
