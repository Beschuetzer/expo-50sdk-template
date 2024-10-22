import { FontAwesome } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Center, Row, useTheme } from 'native-base';
import { ColorType } from 'native-base/lib/typescript/components/types';
import React, { useCallback } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { APP_NAME, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { setError } from '@/state/slices/generalSlice';
import { saveImagesToGallerySelector } from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { pickImage, captureImage, handleError } from '@/utils/helpers';

type ImageCapturerProps = {
  borderColor?: ColorType;
  height?: number;
  onImageChange: (image: string) => void;
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
    onImageChange,
    showSelectImage = true,
    showTakeImage = true,
    style,
  } = props;
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const shouldSaveImagesToGallery = useAppSelector(saveImagesToGallerySelector);

  const getCustomImage = useCallback(
    async (
      resultFetcher: () => Promise<ImagePickerAsset | undefined>,
      onResultFound: (result: string) => void,
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
        onResultFound && onResultFound(result.uri);
      } catch (error) {
        console.error('Error obtaining a custom image: ' + error);
      }
    },
    [],
  );

  const onImageChangeLocal = useCallback(
    async (result: string) => {
      try {
        if (shouldSaveImagesToGallery) {
          const asset = await MediaLibrary.createAssetAsync(result);
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
    getCustomImage(captureImage, (result) => {
      onImageChangeLocal(result);
    });
  }, [onImageChange]);

  const onImageSelectedPress = useCallback(() => {
    getCustomImage(pickImage, (result) => {
      onImageChangeLocal(result);
    });
  }, [onImageChange]);

  return (
    <Row
      style={[{ marginLeft: -theme.space[FORM_INTER_ITEM_SPACING] * 4 }, style]}
    >
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
            Select
          </Center>
        </TouchableOpacity>
      ) : null}
    </Row>
  );
}
