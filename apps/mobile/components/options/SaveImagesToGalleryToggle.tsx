import { Text } from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useEffect } from 'react';

import { ToggleWithText } from './ToggleWithText';

import {
  saveImagesToGallerySelector,
  setSaveImagesToGallery,
} from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { StyleProp } from '@/types/general';

type SaveImagesToGalleryToggleProps = StyleProp;

/**
 *Lets the user opt in to also saving photos captured/selected via `ImageCapturer` to their
 *device's photo gallery (in addition to attaching them to the task).
 **/
export function SaveImagesToGalleryToggle(
  props: SaveImagesToGalleryToggleProps,
) {
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
      <Text mr="$1">Save images to Gallery</Text>
    </ToggleWithText>
  );
}
