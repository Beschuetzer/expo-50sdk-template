import { FontAwesome } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import {
  View,
  Text,
  useTheme,
  Stack,
} from "native-base";
import React, { useRef, useState } from "react";
import { LayoutAnimation, StyleSheet } from "react-native";

//  To toggle LTR/RTL uncomment the next line
// I18nManager.allowRTL(true);

import { useDispatch, useSelector } from "react-redux";

import { ItemTile } from "./ItemTile";
import { SwipeableRow } from "./SwipeableRow";

import { FORM_INTER_ITEM_SPACING } from "@/constants/general";
import {
  currentStoreSelector,
  itemsListArraySelector,
  itemsListSelector,
  removeItemsListItem,
  updateStoreSpecificValues,
} from "@/state/slices/listsSlice";
import { ItemWithStoreSpecificValues, Key } from "@/types/Item";
import { ListRow } from "@/types/general";
import { getKeyToUse } from "@/utils/helpers";

type ItemsListProps = object;

export function ItemsList(props: ItemsListProps) {
  const itemsListArray = useSelector(itemsListArraySelector);
  const itemsList = useSelector(itemsListSelector);
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const list = useRef<FlashList<ItemWithStoreSpecificValues> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function onSwipeRight(key: Key) {
    setRefreshing(false);
    const keyToUse = getKeyToUse(key);
    const currentQuantity =
      itemsList?.[keyToUse as any]?.quantity?.[currentStore.name];
    // console.log({
    //   keyToUse,
    //   quantity: itemsList?.[keyToUse as any]?.quantity,
    //   currentQuantity,
    //   currentStore,
    // });

    dispatch(
      updateStoreSpecificValues({
        key,
        storeSpecificValuesToUpdate: {
          quantity:
            currentQuantity && currentQuantity > 0 ? currentQuantity + 1 : 1,
        },
        storeName: currentStore.name,
      }),
    );
  }

  function onSwipeLeft(key: Key) {
    dispatch(removeItemsListItem(key));
    list.current?.prepareForLayoutAnimationRender();
    // after removing the item, we start animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  return (
    <FlashList
      ref={list}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 10000);
      }}
      data={itemsListArray}
      renderItem={({ item, index }: ListRow<ItemWithStoreSpecificValues>) => {
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
                    name="trash"
                    color={theme.colors.white}
                    size={theme.sizes[8]}
                  />
                </Stack>
              ),
              backgroundColor: theme.colors.red[900],
              onPress: onSwipeLeft.bind(null, key),
            }}
            rightSwipe={{
              backgroundColor: theme.colors.primary[900],
              onPress: onSwipeRight.bind(null, key),
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
                  <Text color={theme.colors.white}>Shopping List</Text>
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
            <ItemTile itemWithStoreSpecificValues={item} />
          </SwipeableRow>
        );
      }}
      keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
        getKeyToUse(item)
      }
      estimatedItemSize={120}
      ItemSeparatorComponent={() => (
        <View
          height={StyleSheet.hairlineWidth}
          backgroundColor={theme.colors.gray[500]}
        />
      )}
    />
  );
}
