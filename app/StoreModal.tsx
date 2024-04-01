import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { StoreForm } from '@/components/forms/StoreForm';
import {
  addStoresListItem,
  storesListItemSelector,
} from '@/state/slices/listsSlice';

export default function StoreModal() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { originalKey } = (route?.params || {}) as any;
  const store = useSelector(storesListItemSelector(originalKey));

  return (
    <StoreForm
      onClose={() => navigation.canGoBack() && navigation.goBack()}
      onSave={(addStoresListItemPayload) => {
        dispatch(addStoresListItem(addStoresListItemPayload));
      }}
      store={store}
      originalKey={originalKey}
    />
  );
}
