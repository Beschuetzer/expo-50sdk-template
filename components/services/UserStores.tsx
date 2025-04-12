import { FlatList, Heading, Stack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { BFF_SERVICE } from './BffService';
import { StoreTile } from '../tiles/StoreTIle';

import { accountSelector, loadingSelector } from '@/state/slices/generalSlice';
import { currentStoreSelector } from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import { Store } from '@/types/Store';
import { ListRow } from '@/types/general';
import { getUserCredentials, handleError } from '@/utils/helpers';

type UserStoreProps = object;

export const UserStores = (props: UserStoreProps) => {
  const dispatch = useDispatch();
  const [stores, setStores] = useState<Store[]>([]);
  const account = useAppSelector(accountSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const loading = useAppSelector(loadingSelector);

  useEffect(() => {
    (async () => {
      try {
        if (!loading) return;
        const stores = await BFF_SERVICE.getUserStores({
          dispatch,
          ...getUserCredentials(account),
        });
        if (!stores) return;
        setStores(stores);
      } catch (error) {
        handleError(dispatch, error as Error, 'Unable to get user stores.');
      }
    })();
  }, [loading]);

  function renderItems(toRender: ListRow<Store>) {
    const { item: store } = toRender;
    return (
      <StoreTile
        store={store}
        currentStore={currentStore}
        currentStoreId={currentStore._id}
      />
    );
  }
  return (
    <Stack>
      <Heading size="md">Stores:</Heading>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={stores}
        renderItem={renderItems}
      />
    </Stack>
  );
};
