import { Center, HStack, Text } from '@gluestack-ui/themed';
import {
  type NavigationProp,
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';

import { ImageCapturer } from '@/components/ImageCapturer';
import { ImageRenderer } from '@/components/ImageRenderer';
import { EMPTY_STRING } from '@/constants/general';
import { type AppParamList, Routes } from '@/constants/navigation';
import { useAppDispatch } from '@/state/store';
import { saveTask } from '@/state/thunks';
import { Task } from '@/types/Task';

export default function FullscreenImageScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const route =
    useRoute<RouteProp<AppParamList, typeof Routes.FullscreenImageScreen>>();
  const { task } = route.params ?? {};
  const taskImage = task?.images?.[task.imageToUseIndex ?? 0] ?? EMPTY_STRING;
  const [customImageUri, setCustomImageUri] = useState(taskImage);

  const imageToUse = useMemo(() => customImageUri, [customImageUri]);

  const onCustomImageCallback = useCallback(
    (result: string) => {
      setCustomImageUri(result);
      if (!task?._id) return;
      dispatch(
        saveTask({
          ...(task as Task),
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
