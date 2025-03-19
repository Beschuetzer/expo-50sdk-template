import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useCallback } from 'react';

import { StoreForm } from '@/components/forms/StoreForm';
import { useAppDispatch } from '@/state/store';
import { saveStore } from '@/state/thunks';
import { AddStoresListItemPayload } from '@/types/listSlice';

export default function StoreModal() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute();
  const { store } = (route?.params || {}) as any;

  const onSavePress = useCallback(
    (addStoresListItemPayload: AddStoresListItemPayload) => {
      dispatch(saveStore(addStoresListItemPayload));
    },
    [],
  );

  const onClosePress = useCallback(
    () => navigation.canGoBack() && navigation.goBack(),
    [navigation],
  );

  return (
    <StoreForm onClose={onClosePress} onSave={onSavePress} store={store} />
  );
}
