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
  const { name } = (route?.params || {}) as any;
  const store = useSelector(storesListItemSelector(name));

  return (
    <StoreForm
      onClose={() => navigation.canGoBack() && navigation.goBack()}
      onSave={(store) => {
        dispatch(addStoresListItem(store));
      }}
      store={store}
    />
  );
}
