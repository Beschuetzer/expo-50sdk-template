import { FontAwesome } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useTheme, Center, Heading, Stack, Text, View } from "native-base";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { ItemTile } from "./ItemTile";
import { SwipeableRow } from "./SwipeableRow";

import { EMPTY_STRING } from "@/constants/general";
import {
  removeItemsListItem,
  shoppingListArraySelector,
  shoppingListSelector,
} from "@/state/slices/listsSlice";
import { ItemWithStoreSpecificValues, Key } from "@/types/Item";
import { ListRow } from "@/types/general";
import { getKeyToUse } from "@/utils/helpers";

type ShoppingListProps = object;

export function ShoppingList(props: ShoppingListProps) {
  const {} = props;
  const shoppingList = useSelector(shoppingListSelector);
  const theme = useTheme();
  const dispatch = useDispatch();

  const onSwipeRight = useCallback((key: Key) => {}, []);

  const onSwipeLeft = useCallback((key: Key) => {
    dispatch(removeItemsListItem(key));
  }, []);

  return (
    <View>
      <Center>
        <Heading p={theme.sizes[2]}>Shopping List</Heading>
      </Center>
      <FlashList
        data={shoppingList}
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
                title: (
                  <Stack
                    paddingLeft={theme.space[2]}
                    alignItems="center"
                  >
                    <FontAwesome
                      name="check"
                      color={theme.colors.white}
                      size={theme.sizes[8]}
                    />
                    <Text color={theme.colors.white}>In Cart</Text>
                  </Stack>
                ),
              }}
            >
              <ItemTile itemWithStoreSpecificValues={item} />
            </SwipeableRow>
          );
        }}
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          `item ${index}`
        }
        estimatedItemSize={230}
        ItemSeparatorComponent={() => (
          <View
            height={StyleSheet.hairlineWidth}
            backgroundColor={theme.colors.gray[500]}
          />
        )}
      />
    </View>
  );
}
