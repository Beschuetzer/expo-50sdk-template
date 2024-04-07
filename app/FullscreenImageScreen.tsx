import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Text } from 'native-base';
import { useEffect, useMemo } from 'react';

import { ImageRenderer } from '@/components/ImageRenderer';
import { useUpcProduct } from '@/components/hooks/useUpcProduct';
import { EMPTY_STRING } from '@/constants/general';
import { Item } from '@/types/Item';

export default function FullscreenImageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
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
    return <Text>Need to handle undefined case</Text>;
  }
  return (
    <ImageRenderer source={imageToUse} item={item} height="auto" width="100%" />
  );
}
