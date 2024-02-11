import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTheme, Center, Heading, Row, View, Stack, Text } from "native-base";
import { StyleSheet } from "react-native";
import { FlatList, RectButton } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";

import { SwipeableRow } from "./SwipeableRow";

import { FORM_INTER_ITEM_SPACING, EMPTY_STRING } from "@/constants/general";
import { Routes } from "@/constants/navigation";
import {
  removeStoresListItem,
  storesListArraySelector,
} from "@/state/slices/listsSlice";
import { Key } from "@/types/Item";
import { Store } from "@/types/Store";
import { ListRow } from "@/types/general";
import { getKeyToUse } from "@/utils/helpers";

export function StoresList() {
  const storesList = useSelector(storesListArraySelector);
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  console.log({ storesList });

  return (
    <Stack>
      <Center>
        <Heading p={theme.sizes[2]}>Stores List</Heading>
      </Center>
      <FlatList
        data={storesList}
        renderItem={({ item, index }: ListRow<Store>) => {
          console.log({ item, index });

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
                onPress: () => alert("left"),
                title: (
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
                <Row space={theme.space[2]}>
                  <Text fontSize={16}>
                    {item.name} ({item.gpsCoordinates?.lat},{" "}
                    {item.gpsCoordinates?.lon})
                  </Text>
                </Row>
              </RectButton>
            </SwipeableRow>
          );
        }}
        keyExtractor={(item: Store, index: number) => `${item.name}-${index}`}
        estimatedItemSize={80} //todo: caculate this approriately
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
