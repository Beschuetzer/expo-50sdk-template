import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ItemTile } from './ItemTile';
import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';
import { SortType } from './sorters';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import {
  ListName,
  addItemToCart,
  currentStoreSelector,
  storeSpecificListSelector,
  shoppingListSelector,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import { ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { ListRow } from '@/types/general';
import { getKeyToUse } from '@/utils/helpers';

type ShoppingListProps = object;

export const shoppingListSortTypes = [
  SortType.Name,
  SortType.Upc,
  SortType.AddedDate,
  SortType.LastUpdatedDate,
  SortType.Frequency,
] as SortType[];

const listName: ListName = ListName.ShoppingList;
export function ShoppingList(props: ShoppingListProps) {
  const shoppingListToDisplay = useSelector(
    storeSpecificListSelector(listName),
  );
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const onSwipeRight = useCallback((item: ItemWithStoreSpecificValues) => {
    setRefreshing(false);
    dispatch(addItemToCart(item));
  }, []);

  const onSwipeLeft = useCallback(
    (key: Key) => {
      dispatch(
        updateStoreSpecificValues({
          key,
          storeSpecificValuesToUpdate: {
            isInCart: (current) => false,
            quantity: (current) => 0,
          },
        }),
      );
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    [listRef],
  );

  function renderItem({ item, index }: ListRow<ItemWithStoreSpecificValues>) {
    const key = {
      name: item.name,
      upc: item.upc,
    } as Key;
    return (
      <SwipeableRow
        leftSwipe={{
          title: (
            <Stack paddingRight={theme.space[2]} alignItems="center">
              <FontAwesome
                name="remove"
                color={theme.colors.white}
                size={theme.sizes[8]}
              />
              <Text color={theme.colors.white}>Remove</Text>
            </Stack>
          ),
          backgroundColor: theme.colors.red[900],
          onPress: onSwipeLeft.bind(null, key),
        }}
        rightSwipe={{
          backgroundColor: theme.colors.primary[900],
          onPress: onSwipeRight.bind(null, item),
          title: currentStore.name ? (
            <Stack
              paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
              alignItems="center"
            >
              <FontAwesome
                name="plus"
                color={theme.colors.white}
                size={theme.sizes[8]}
              />
              <Text color={theme.colors.white}>To Cart</Text>
            </Stack>
          ) : (
            <Text
              width={150}
              numberOfLines={2}
              paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
              color={theme.colors.white}
            >
              Select a Store to Add to Shopping List
            </Text>
          ),
        }}
      >
        <ItemTile
          isMultiSelectMode={isMultiSelectMode}
          item={item}
          buttonProps={{
            onLongPress: () => {
              setSelectedItems(isMultiSelectMode ? [] : [item]);
              setIsMultiSelectMode((current) => !current);
            },
          }}
          onSelect={(item) => {
            const isSelected = !!selectedItems.find(
              (itemLocal) => getKeyToUse(item) === getKeyToUse(itemLocal),
            );
            if (isSelected) {
              setSelectedItems((current) =>
                current.filter(
                  (itemLocal) => getKeyToUse(item) !== getKeyToUse(itemLocal),
                ),
              );
            } else {
              setSelectedItems((current) => {
                return [...current, item];
              });
            }
          }}
          isSelected={
            !!selectedItems.find(
              (itemLocal) => getKeyToUse(item) === getKeyToUse(itemLocal),
            )
          }
        />
      </SwipeableRow>
    );
  }

  return (
    <>
      <FlashList
        ref={listRef}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        data={shoppingListToDisplay}
        renderItem={renderItem}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          getKeyToUse(item)
        }
        estimatedItemSize={120}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
    </>
  );
}
