import { FontAwesome } from '@expo/vector-icons';
import { Center, HStack } from '@gluestack-ui/themed';
import { ImagePickerAsset, ImagePickerOptions } from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { APP_NAME, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { setError } from '@/state/slices/generalSlice';
import { saveImagesToGallerySelector } from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { pickImage, captureImage, handleError } from '@/utils/helpers';

type ImageCapturerProps = {
  borderColor?: string;
  height?: number;
  imageOptions?: ImagePickerOptions;
  onImageChange: (image: ImagePickerAsset) => void;
  showTakeImage?: boolean;
  showSelectImage?: boolean;
  style?: ViewStyle;
  width?: number;
};

export function ImageCapturer(props: ImageCapturerProps) {
  const {
    borderColor,
    height = 50,
    width = 75,
    imageOptions,
    onImageChange,
    showSelectImage = true,
    showTakeImage = true,
    style,
  } = props;
  const dispatch = useAppDispatch();
  const shouldSaveImagesToGallery = useAppSelector(saveImagesToGallerySelector);

  const getCustomImage = useCallback(
    async (
      resultFetcher: () => Promise<ImagePickerAsset | undefined>,
      onResultFound: (result: ImagePickerAsset) => void,
    ) => {
      try {
        const result = (await resultFetcher()) || null;
        if (!result) {
          dispatch(
            setError({
              message: 'Unable to get an image from the resultFetcher',
            }),
          );
          return;
        }
        onResultFound && onResultFound(result);
      } catch (error) {
        console.error('Error obtaining a custom image: ' + error);
      }
    },
    [],
  );

  const onImageChangeLocal = useCallback(
    async (result: ImagePickerAsset) => {
      try {
        if (shouldSaveImagesToGallery) {
          const asset = await MediaLibrary.createAssetAsync(result.uri);
          await MediaLibrary.createAlbumAsync(APP_NAME, asset, false);
        }
      } catch (error) {
        handleError(dispatch, error as Error);
      } finally {
        onImageChange && onImageChange(result);
      }
    },
    [onImageChange, shouldSaveImagesToGallery],
  );

  const onImageTakenPress = useCallback(() => {
    getCustomImage(captureImage.bind(null, imageOptions), (result) => {
      onImageChangeLocal(result);
    });
  }, [onImageChange]);

  const onImageSelectedPress = useCallback(() => {
    getCustomImage(pickImage.bind(null, imageOptions), (result) => {
      onImageChangeLocal(result);
    });
  }, [onImageChange]);

  return (
    <HStack style={[{ marginLeft: -FORM_INTER_ITEM_SPACING * 4 }, style]}>
      {showTakeImage ? (
        <TouchableOpacity onPress={onImageTakenPress}>
          <Center borderColor={borderColor} width={width} height={height}>
            <FontAwesome name="camera" size={height} />
          </Center>
        </TouchableOpacity>
      ) : null}
      {showSelectImage ? (
        <TouchableOpacity onPress={onImageSelectedPress}>
          <Center borderColor={borderColor} width={width} height={height}>
            <FontAwesome name="image" size={height} />
          </Center>
        </TouchableOpacity>
      ) : null}
    </HStack>
  );
}
