import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

import { ImageRenderer } from '@/components/ImageRenderer';
import { IMAGE_RENDERER_TITLE_DEFAULT } from '@/constants/general';
import { Item } from '@/types/Item';

export default function FullscreenImageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { source, item } = (route.params || {}) as {
    source: string;
    item: Item;
  };
  console.log({ source });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: item?.name || IMAGE_RENDERER_TITLE_DEFAULT,
      headerTitleAlign: 'center',
    });
  }, []);

  return <ImageRenderer source={source} item={item} />;
}
