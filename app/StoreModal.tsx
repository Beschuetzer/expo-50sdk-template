import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { StoreForm } from '@/components/forms/StoreForm';
import { ListHeaderRight } from '@/components/header/ListHeaderRight';
import { useMenu } from '@/components/hooks/useMenu';
import { StoreSelectionModal } from '@/components/modals/StoreSelectionModal';
import { copyStoreSpecificValues } from '@/state/slices/listsSlice';
import { useAppDispatch } from '@/state/store';
import { saveStore } from '@/state/thunks';
import { Store } from '@/types/Store';
import { AddStoresListItemPayload } from '@/types/listSlice';

export default function StoreModal() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute();
  const { store } = (route?.params || {}) as any;
  const [isStoreSelectionModalVisible, setIsStoreSelectionModalVisible] =
    useState(false);
  const sourceStoreRef = useRef<Store | null>(null);
  const destinationStoreRef = useRef<Store | null>(null);

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

  const resetRefs = useCallback(() => {
    sourceStoreRef.current = null;
    destinationStoreRef.current = null;
  }, []);

  useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          options={[
            {
              text: 'Copy Store Specific Values to ...',
              onPress: () => {
                setIsStoreSelectionModalVisible(true);
                sourceStoreRef.current = store;
              },
            },
            {
              text: 'Copy Store Specific Values from ...',
              onPress: () => {
                setIsStoreSelectionModalVisible(true);
                destinationStoreRef.current = store;
              },
            },
          ]}
        />
      ),
    }),
  });

  return (
    <>
      <StoreForm onClose={onClosePress} onSave={onSavePress} store={store} />
      <StoreSelectionModal
        canSelectCurrentStore
        title={
          sourceStoreRef.current === store
            ? `Copy values from '${sourceStoreRef.current?.name}' to:`
            : `Copy values to '${destinationStoreRef.current?.name}' from:`
        }
        onCancel={() => {
          setIsStoreSelectionModalVisible(false);
          resetRefs();
        }}
        isVisible={isStoreSelectionModalVisible}
        storesToOmit={[store]}
        onConfirm={(selectedStore) => {
          setIsStoreSelectionModalVisible(false);
          if (selectedStore) {
            dispatch(
              copyStoreSpecificValues({
                destination: destinationStoreRef.current || selectedStore,
                source: sourceStoreRef.current || selectedStore,
              }),
            );
          }
          resetRefs();
        }}
      />
    </>
  );
}
