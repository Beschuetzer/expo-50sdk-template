import { Center, HStack, Text } from '@gluestack-ui/themed';
import { useRoute } from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';

import { ImageCapturer } from '@/components/ImageCapturer';
import { ImageRenderer } from '@/components/ImageRenderer';
import { EMPTY_STRING } from '@/constants/general';
import { useAppDispatch } from '@/state/store';
import { saveTask } from '@/state/thunks';
import { Task } from '@/types/Task';

export default function FullscreenImageScreen() {
  const dispatch = useAppDispatch();
  const route = useRoute();
  const { task } = (route.params || {}) as { task: Task };
  const [customImageUri, setCustomImageUri] = useState(
    task?.images?.[task?.imageToUseIndex] || EMPTY_STRING,
  );

  const imageToUse = useMemo(() => customImageUri, [customImageUri]);

  const onCustomImageCallback = useCallback(
    (result: string) => {
      setCustomImageUri(result);
      if (!task?._id) return;
      dispatch(
        saveTask({
          ...task,
          images: [result],
          imageToUseIndex: 0,
        }),
      );
    },
    [task, dispatch],
  );

  const onImageChange = useCallback(
    (result: ImagePickerAsset) => {
      onCustomImageCallback(result.uri);
    },
    [onCustomImageCallback],
  );

  return (
    <Center flex={1}>
      {imageToUse ? (
        <ImageRenderer
          source={imageToUse}
          showFullscreenOnPress={false}
          style={{ width: '100%', height: '80%' }}
        />
      ) : (
        <Text>No image available.</Text>
      )}
      <HStack mt="$4">
        <ImageCapturer onImageChange={onImageChange} />
      </HStack>
    </Center>
  );
}
