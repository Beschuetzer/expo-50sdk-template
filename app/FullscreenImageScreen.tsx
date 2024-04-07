import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ImageRenderer } from '@/components/ImageRenderer';
import { EMPTY_STRING } from '@/constants/general';
import { upcProductSelector } from '@/state/slices/scannerSlice';
import { Item } from '@/types/Item';

export default function FullscreenImageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { source, item } = (route.params || {}) as {
    source: string;
    item: Item;
  };
  const upcProduct = useSelector(upcProductSelector(item?.upc || EMPTY_STRING));
  console.log({ upcData: upcProduct });

  useEffect(() => {
    if (!item?.name) return;
    navigation.setOptions({
      headerTitle: item?.name,
    });
  }, []);

  return <ImageRenderer source={upcProduct?.image_url || source} item={item} />;
}
