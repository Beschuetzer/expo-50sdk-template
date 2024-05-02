import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { StoreForm } from '@/components/forms/StoreForm';
import {
  AddStoresListItemPayload,
  addStoresListItem,
  storesListItemSelector,
} from '@/state/slices/listsSlice';

export default function StoreModal() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { originalKey } = (route?.params || {}) as any;
  const store = useSelector(storesListItemSelector(originalKey));

  const onSavePress = useCallback(
    (addStoresListItemPayload: AddStoresListItemPayload) => {
      dispatch(addStoresListItem(addStoresListItemPayload));
    },
    [],
  );

  const onClosePress = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    [navigation],
  );

  return (
    <StoreForm
      onClose={onClosePress}
      onSave={onSavePress}
      store={store}
      originalKey={originalKey}
    />
  );
}
