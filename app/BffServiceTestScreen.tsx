import { Button, Row, Stack } from 'native-base';
import { useCallback } from 'react';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import { UserAccountRenderer } from '@/components/UserAccountRenderer';
import {
  getRandomInt,
  getRandomItem,
  getRandomStoreSpecificValues,
} from '@/components/mocks/helpers';
import { UserItems } from '@/components/services/UserItems';
import { UserStores } from '@/components/services/UserStores';
import { EMPTY_STRING } from '@/constants/general';
import {
  currentStoreSelector,
  storesListSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { saveItem } from '@/state/thunks';
import { StoreSpecificValues } from '@/types/Item';

export default function BffServiceTestScreen() {
  const dispatch = useAppDispatch();
  const currentStore = useAppSelector(currentStoreSelector);
  const storesList = useAppSelector(storesListSelector);

  const saveItemWithNoIdPress = useCallback(async () => {
    dispatch(
      saveItem({
        item: getRandomItem(getRandomInt(1, 999999999999)),
        storeSpecificValues: {
          ...getRandomStoreSpecificValues(),
          quantity: {
            [currentStore.name]: 1,
          },
        } as StoreSpecificValues,
        hasKeyChanged: false,
        originalKey: { name: EMPTY_STRING, upc: EMPTY_STRING },
      }),
    );
  }, []);

  /**
   *The idea heere is that an item is save to the db then it is changed locally and then the saveAll method is called
   *What does the response look like?
   **/
  const saveItemThenChangeAndSyncAllItems = useCallback(async () => {
    // const data = {
    //   item: getRandomItem(getRandomInt(1, 999999999999)),
    //   storeSpecificValues: {
    //     ...getRandomStoreSpecificValues(),
    //     quantity: {
    //       [currentStore.name]: 1,
    //     },
    //   } as StoreSpecificValues,
    //   dispatch,
    // };
    // const id = getItemId(data.item, TEST_EMAIL);
    // const saveItemResult = await BFF_SERVICE.saveItem(data);
    // const saveAllResult = await BFF_SERVICE.saveAllToDb({
    //   dispatch,
    //   items: {
    //     data: [
    //       {
    //         ...data.item,
    //         unit: 'something unexpected',
    //       },
    //     ],
    //     filters: {},
    //     sortOrderValue: {
    //       sortBy: SortType.Name,
    //       sortOrder: SortOrder.Ascending,
    //     },
    //   },
    //   lastPurchasedMap: {},
    //   stores: {
    //     ...storesList,
    //     currentStoreName: currentStore.name,
    //   },
    //   storeSpecificValues: {},
    // });
  }, [currentStore, storesList]);

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <Stack>
          <UserAccountRenderer />
          <Row>
            <Button onPress={saveItemWithNoIdPress}>
              Save Item with No Id
            </Button>
            {/* <Button onPress={saveItemThenChangeAndSyncAllItems}>
              Save Item and Sync Different Item with Same Key
            </Button> */}
          </Row>
        </Stack>
      }
    >
      <UserItems />
      <UserStores />
    </AbsolutePositionedScreen>
  );
}
