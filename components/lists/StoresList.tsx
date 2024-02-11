import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useNavigation } from "expo-router";
import { useTheme, Center, Heading, Row, View, Stack, Text } from "native-base";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { FlatList, RectButton } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";

import { SwipeableRow } from "./SwipeableRow";

import { FORM_INTER_ITEM_SPACING, EMPTY_STRING } from "@/constants/general";
import { Routes } from "@/constants/navigation";
import { currentLocationSelector } from "@/state/slices/generalSlice";
import {
  removeStoresListItem,
  setCurrentStoreName,
  storesListArraySelector,
} from "@/state/slices/listsSlice";
import { Key } from "@/types/Item";
import { Store } from "@/types/Store";
import { ListRow } from "@/types/general";
import { calculateDistance, getKeyToUse } from "@/utils/helpers";

export function StoresList() {
  const storesList = useSelector(storesListArraySelector);
  const currentLocation = useSelector(currentLocationSelector);
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  console.log({ storesList });

  const sortedByDistance = useMemo(() => {
    return storesList
      .map((store) => {
        return {
          ...store,
          calculatedDistance: calculateDistance(
            currentLocation,
            store.gpsCoordinates,
          ),
        };
      })
      .sort((current: Store, next: Store) => {
        console.log({ current, next });
        if (!current.calculatedDistance && next.calculatedDistance) return 1;
        if (current.calculatedDistance && !next.calculatedDistance) return -1;
        if (current.calculatedDistance === next.calculatedDistance) return 0;
        if (
          current !== undefined &&
          next !== undefined &&
          current.calculatedDistance <= next.calculatedDistance
        )
          return -1;
        return 1;
      });
  }, [storesList, currentLocation]);

  return (
    <Stack>
      <FlatList
        data={sortedByDistance}
        renderItem={({ item, index }: ListRow<Store>) => {
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
                onPress: () => {
                  dispatch(removeStoresListItem(keyToUse));
                },
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
              key={`${index}-${getKeyToUse({ name: item?.name || EMPTY_STRING, upc: item?.upc || EMPTY_STRING })}`}
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
                    <Stack justifyContent="center">
                      <Text fontSize={16}>
                        {item.name} ({item.gpsCoordinates?.lat},{" "}
                        {item.gpsCoordinates?.lon})
                      </Text>
                      <Text>
                        Estimated Distance: {item.calculatedDistance}
                        mi.
                      </Text>
                    </Stack>
                    <Stack>
                      <TouchableOpacity
                        onPress={() => dispatch(removeStoresListItem(keyToUse))}
                      >
                        <Text>Set as Current</Text>
                      </TouchableOpacity>
                    </Stack>
                  </Row>
                </Stack>
              </RectButton>
            </SwipeableRow>
          );
        }}
        keyExtractor={(item: Store, index: number) => `${item.name}-${index}`}
        ItemSeparatorComponent={() => (
          <View
            height={StyleSheet.hairlineWidth}
            backgroundColor={theme.colors.gray[500]}
          />
        )}
      />
    </Stack>
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
