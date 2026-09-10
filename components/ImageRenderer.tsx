import { FontAwesome } from '@expo/vector-icons';
import { Box } from '@gluestack-ui/themed';
import { Image, ImageProps } from 'expo-image';
import { useNavigation } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import {
  FORM_INTER_ITEM_SPACING,
  IMAGE_RENDERER_ASPECT_RATIO_DEFAULT,
  IMAGE_RENDERER_SHOW_FULL_SCREEN_ON_PRESS_DEFAULT,
  IMAGE_RENDERER_WIDTH_DEFAULT,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { Task } from '@/types/Task';
import { ItemProp } from '@/types/general';

type ImageRendererProps = {
  height?: number | string;
  width?: number | string;
  showFullscreenOnPress?: boolean;
  title?: string;
  useMarginRight?: boolean;
} & ImageProps &
  Partial<ItemProp<Task>> & { task?: Task };

export function ImageRenderer(props: ImageRendererProps) {
  const navigation = useNavigation();
  const {
    task,
    source,
    cachePolicy = 'disk',
    showFullscreenOnPress = IMAGE_RENDERER_SHOW_FULL_SCREEN_ON_PRESS_DEFAULT,
    height = IMAGE_RENDERER_WIDTH_DEFAULT * IMAGE_RENDERER_ASPECT_RATIO_DEFAULT,
    width = IMAGE_RENDERER_WIDTH_DEFAULT,
    useMarginRight = false,
  } = props;
  const [isError, setIsError] = useState(false);
  const taskImage = useMemo(
    () => task?.images?.[task?.imageToUseIndex],
    [task],
  );

  const onImagePress = useCallback(() => {
    if (!showFullscreenOnPress || !task) return;
    // @ts-ignore -- expo-router v3 typed params
    navigation.navigate(Routes.FullscreenImageScreen, { task });
  }, [navigation, source, showFullscreenOnPress, task]);

  return (
    <TouchableOpacity onPress={onImagePress}>
      <Box
        height={height as number}
        width={width as number}
        bg="$backgroundLight200"
        overflow="hidden"
        mt="$1"
        mr={useMarginRight ? FORM_INTER_ITEM_SPACING * 3 : 0}
        alignItems="center"
        justifyContent="center"
      >
        {(!source && !taskImage) || isError ? (
          <FontAwesome
            name="image"
            size={
              parseFloat(width as string) / IMAGE_RENDERER_ASPECT_RATIO_DEFAULT
            }
          />
        ) : (
          <Image
            cachePolicy={cachePolicy}
            {...props}
            source={source || taskImage}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
            onError={() => setIsError(true)}
          />
        )}
      </Box>
    </TouchableOpacity>
  );
}
