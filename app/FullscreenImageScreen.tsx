import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

import { ImageRenderer } from '@/components/ImageRenderer';
import { Item } from '@/types/Item';

export default function FullscreenImageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { source, item } = (route.params || {}) as {
    source: string;
    item: Item;
  };

  useEffect(() => {
    if (!item?.name) return;
    navigation.setOptions({
      headerTitle: item?.name,
    });
  }, []);

  return <ImageRenderer source={source} item={item} />;
}
