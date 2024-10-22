import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Center, Row, Text, useTheme } from 'native-base';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FullscreenSpinner } from '@/components/FullscreenSpinner';
import { ImageCapturer } from '@/components/ImageCapturer';
import { ImageRenderer } from '@/components/ImageRenderer';
import { useUpcProduct } from '@/components/hooks/useUpcProduct';
import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { LOCAL_FILE_REGEX } from '@/constants/regexs';
import { useAppDispatch } from '@/state/store';
import { saveItem } from '@/state/thunks';
import { Item } from '@/types/Item';

export default function FullscreenImageScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute();
  const theme = useTheme();
  const { item } = (route.params || {}) as {
    item: Item;
  };
  const [customImageUri, setCustomImageUri] = useState(
    item?.fullscreenImage ||
      item?.images?.[item?.imageToUseIndex]?.match(LOCAL_FILE_REGEX)
      ? item?.images[item?.imageToUseIndex]
      : EMPTY_STRING,
  );
  const { upcProduct, isLoading } = useUpcProduct({
    upc: item?.upc || EMPTY_STRING,
    shouldSkip: !!customImageUri,
  });
  const imageToUse = useMemo(
    () =>
      customImageUri ||
      upcProduct?.image_url ||
      upcProduct?.image_front_url ||
      item.images[item.imageToUseIndex],
    [upcProduct, customImageUri],
  );

  const onCustomImageCallback = useCallback(
    (result: string) => {
      setCustomImageUri(result);
      const newItem = {
        ...item,
        images: [result],
        imageToUseIndex: 0,
        fullscreenImage: result,
      } as Item;
      dispatch(
        saveItem({
          hasKeyChanged: false,
          item: newItem,
          originalKey: newItem,
        }),
      );
    },
    [item, customImageUri],
  );

  const onImageChange = useCallback(
    (result: string) => {
      onCustomImageCallback(result);
    },
    [onCustomImageCallback],
  );

  useEffect(() => {
    if (!item?.name) return;
    navigation.setOptions({
      headerTitle: item?.name,
    });
  }, []);

  if (isLoading) {
    return <FullscreenSpinner />;
  }
  if (!imageToUse) {
    return (
      <Center height="100%">
        <Text>No image found for '{item?.name || item.upc}'</Text>
        <Row
          space={theme.space[FORM_INTER_ITEM_SPACING]}
          mt={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          <ImageCapturer onImageChange={onImageChange} />
        </Row>
      </Center>
    );
  }
  return (
    <ImageRenderer source={imageToUse} item={item} height="auto" width="100%" />
  );
}
