import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Center, Row, Text, useTheme } from 'native-base';
import { useEffect, useMemo } from 'react';

import { ImageCapturer } from '@/components/ImageCapturer';
import { ImageRenderer } from '@/components/ImageRenderer';
import { useUpcProduct } from '@/components/hooks/useUpcProduct';
import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Item } from '@/types/Item';

export default function FullscreenImageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { item } = (route.params || {}) as {
    item: Item;
  };
  const { upcProduct } = useUpcProduct({
    upc: item?.upc || EMPTY_STRING,
  });
  const imageToUse = useMemo(
    () => upcProduct?.image_url || upcProduct?.image_front_url,
    [upcProduct],
  );

  useEffect(() => {
    if (!item?.name) return;
    navigation.setOptions({
      headerTitle: item?.name,
    });
  }, []);

  if (!imageToUse) {
    return (
      <Center height="100%">
        <Text>No image found for '{item?.name || item.upc}'</Text>
        <Row
          space={theme.space[FORM_INTER_ITEM_SPACING]}
          mt={theme.space[FORM_INTER_ITEM_SPACING]}
        >
          <ImageCapturer
            onCameraPress={() => alert('camera pressed')}
            onSelectPress={() => alert('Select pressed')}
          />
        </Row>
      </Center>
    );
  }
  return (
    <ImageRenderer source={imageToUse} item={item} height="auto" width="100%" />
  );
}
