import { FlatList, Heading, Stack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { BFF_SERVICE } from './BffService';
import { ItemTile } from '../tiles/ItemTile';

import { accountSelector, loadingSelector } from '@/state/slices/generalSlice';
import { useAppSelector } from '@/state/store';
import { Item } from '@/types/Item';
import { ListRow } from '@/types/general';
import { ListName } from '@/types/listSlice';
import { getUserCredentials, handleError } from '@/utils/helpers';

type UserItemProps = object;

export const UserItems = (props: UserItemProps) => {
  const dispatch = useDispatch();
  const [items, setItems] = useState<Item[]>([]);
  const account = useAppSelector(accountSelector);
  const loading = useAppSelector(loadingSelector);

  useEffect(() => {
    (async () => {
      try {
        if (!loading) return;
        const items = await BFF_SERVICE.getUserItems({
          dispatch,
          ...getUserCredentials(account),
        });
        if (!items) return;
        setItems(items);
      } catch (error) {
        handleError(dispatch, error as Error, 'Unable to get user items.');
      }
    })();
  }, [loading]);

  function renderItems(toRender: ListRow<Item>) {
    const { item } = toRender;
    return <ItemTile item={item} listName={ListName.ItemsList} />;
  }
  return (
    <Stack>
      <Heading size="md">Items:</Heading>
      <FlatList data={items} renderItem={renderItems} />
    </Stack>
  );
};
