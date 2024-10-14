import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useTheme, Text } from 'native-base';
import React, { useCallback, useEffect } from 'react';

import { ToggleWithText } from './ToggleWithText';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  saveImagesToGallerySelector,
  setSaveImagesToGallery,
} from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { StyleProp } from '@/types/general';

type ImageSaveLocationSpecifierProps = StyleProp;

export function SaveImagesToGallerySlider(
  props: ImageSaveLocationSpecifierProps,
) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const saveImagesToGallery = useAppSelector(saveImagesToGallerySelector);

  const toggleSwitch = useCallback(() => {
    dispatch(setSaveImagesToGallery(!saveImagesToGallery));
  }, [saveImagesToGallery]);

  useEffect(() => {
    (async () => {
      if (!saveImagesToGallery) return;
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const canAccessCamera = cameraStatus.status === 'granted';

      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      const canAccessMediaLibrary = mediaLibraryStatus.status === 'granted';

      if (!canAccessCamera || !canAccessMediaLibrary)
        dispatch(setSaveImagesToGallery(false));
    })();
  }, [saveImagesToGallery]);

  return (
    <ToggleWithText
      switchProps={{
        onValueChange: toggleSwitch,
        value: saveImagesToGallery,
      }}
    >
      <Text mr={theme.space[FORM_INTER_ITEM_SPACING]}>
        Save images to Gallery
      </Text>
    </ToggleWithText>
  );
}
