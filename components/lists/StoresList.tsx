import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "expo-router";
import { useTheme, Center, Heading, Row, View, Stack, Text } from "native-base";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutAnimation, StyleSheet } from "react-native";
import { FlatList, RectButton } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";

import { ListSorter } from "./ListSorter";
import { SwipeableRow } from "./SwipeableRow";
import { SORTERS, SortType } from "./sorters";

import { FORM_INTER_ITEM_SPACING, EMPTY_STRING } from "@/constants/general";
import { Routes } from "@/constants/navigation";
import { currentLocationSelector } from "@/state/slices/generalSlice";
import {
  currentStoreSelector,
  removeStoresListItem,
  setCurrentStoreName,
  setStoresList,
  storesListArraySelector,
  storesListSortTypeSelector,
} from "@/state/slices/listsSlice";
import { Key } from "@/types/Item";
import { Store } from "@/types/Store";
import { ListRow } from "@/types/general";
import { calculateDistance, getKeyToUse } from "@/utils/helpers";

export function StoresList() {
  const storesList = useSelector(storesListArraySelector);
  const currentLocation = useSelector(currentLocationSelector);
  const storesListSortType = useSelector(storesListSortTypeSelector);
  const currentStore = useSelector(currentStoreSelector);
  const hasPopulatedStoresListWithDistances = useRef(false);
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  console.log({ storesList });

  const listRef = useRef<FlashList<Store> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onSortTypeChange = useCallback(
    (sortType: SortType) => {
      const sortedList = [...storesList.sort(SORTERS[sortType])];
      console.log(sortType, sortedList);
      dispatch(setStoresList(sortedList));
    },
    [storesList],
  );

  const onSwipeLeft = useCallback(
    (keyToUse: Key) => {
      dispatch(removeStoresListItem(keyToUse));
      listRef.current?.prepareForLayoutAnimationRender();
      // after removing the item, we start animation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    [listRef],
  );

  useEffect(() => {
    hasPopulatedStoresListWithDistances.current = false;
  }, [currentLocation])

  useEffect(() => {
    if (hasPopulatedStoresListWithDistances.current) return
    hasPopulatedStoresListWithDistances.current = true
    const sortedWithDistances = storesList
      .map((store) => ({
        ...store,
        calculatedDistance: calculateDistance(
          currentLocation,
          store.gpsCoordinates,
        ),
      }))
      .sort(SORTERS[storesListSortType])
    console.log({ sortedWithDistances })

    dispatch(setStoresList(sortedWithDistances))
  }, [storesList, currentLocation, hasPopulatedStoresListWithDistances])

  function renderItem({ item, index }: ListRow<Store>) {
    const keyToUse = {
      name: item.name,
      upc: EMPTY_STRING,
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
          onPress: onSwipeLeft.bind(null, keyToUse),
        }}
        rightSwipe={{
          backgroundColor: theme.colors.primary[900],
          onPress: () => {
            dispatch(setCurrentStoreName(keyToUse?.name));
          },
          title: (
            <Stack
              paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
              alignItems="center"
            >
              <Text color={theme.colors.white}>Set as Current</Text>
            </Stack>
          ),
        }}
      >
        <RectButton
          style={styles.rectButton}
          onPress={() => {
            navigation.navigate(Routes.StoreModal, {
              name: keyToUse.name,
            });
          }}
        >
          <Stack>
            <Row
              px={theme.space[FORM_INTER_ITEM_SPACING]}
              space={theme.space[2]}
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack flex={1} justifyContent="center">
                <Text fontSize={theme.fontSizes["lg"]}>{item.name}</Text>
                {/* <Text>
                      ({item.gpsCoordinates?.lat}, {item.gpsCoordinates?.lon})
                    </Text> */}
                <Text>
                  Estimated Distance:{" "}
                  {!item?.calculatedDistance || item.calculatedDistance === -1
                    ? "N/A"
                    : `${item.calculatedDistance}mi.`}
                </Text>
              </Stack>
              <Stack>
                {currentStore?.name !== keyToUse.name ? (
                  <TouchableOpacity
                    onPress={() => dispatch(setCurrentStoreName(keyToUse.name))}
                  >
                    <Text color={theme.colors.info[900]}>Set as Current</Text>
                  </TouchableOpacity>
                ) : (
                  <Text>Current</Text>
                )}
              </Stack>
            </Row>
          </Stack>
        </RectButton>
      </SwipeableRow>
    );
  }

  return (
    <FlashList
      ref={listRef}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }}
      ListHeaderComponent={
        <ListSorter
          onValueChange={onSortTypeChange}
          sortTypes={[SortType.Distance, SortType.Name]}
        />
      }
      data={storesList}
      estimatedItemSize={150}
      keyExtractor={(item: Store, index: number) =>
        getKeyToUse({ name: item.name, upc: EMPTY_STRING })
      }
      ItemSeparatorComponent={() => (
        <View
          height={StyleSheet.hairlineWidth}
          backgroundColor={theme.colors.gray[500]}
        />
      )}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  rectButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    flexDirection: "column",
    backgroundColor: "white",
  },
  fromText: {
    fontWeight: "bold",
    backgroundColor: "transparent",
  },
  messageText: {
    color: "#999",
    backgroundColor: "transparent",
  },
  dateText: {
    backgroundColor: "transparent",
    position: "absolute",
    right: 20,
    top: 10,
    color: "#999",
    fontWeight: "bold",
  },
});
