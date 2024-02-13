import { useNavigation } from "expo-router";
import { Row, Column, Text } from "native-base";
import { StyleSheet } from "react-native";
import { RectButton } from "react-native-gesture-handler";

import { ImageRenderer } from "../ImageRenderer";

import { Routes } from "@/constants/navigation";
import { ItemWithStoreSpecificValuesProp } from "@/types/general";

type ItemTileProps = ItemWithStoreSpecificValuesProp;

export function ItemTile(props: ItemTileProps) {
  const navigation = useNavigation();
  const { itemWithStoreSpecificValues } = props;

  return (
    <RectButton
      style={styles.rectButton}
      onPress={() => {
        navigation.navigate(Routes.ItemModal, {
          key:
            itemWithStoreSpecificValues.upc || itemWithStoreSpecificValues.name,
          showOverrideMsg: false,
        });
      }}
    >
      <Row space={2}>
        <ImageRenderer
          source={
            itemWithStoreSpecificValues.images[
              itemWithStoreSpecificValues.imageToUseIndex
            ]
          }
        />
        <Column>
          <Text>{itemWithStoreSpecificValues.name}</Text>
          <Text>{itemWithStoreSpecificValues.upc}</Text>
          <Text>Frequency: {itemWithStoreSpecificValues.frequency}</Text>
          <Text>Unit: {itemWithStoreSpecificValues?.unit}</Text>
          <Text>
            Added:{" "}
            {new Date(itemWithStoreSpecificValues.addedDate).toLocaleString()}
          </Text>
          <Text>
            Updated:{" "}
            {new Date(
              itemWithStoreSpecificValues.lastUpdatedDate,
            ).toLocaleString()}
          </Text>
        </Column>
      </Row>
    </RectButton>
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
});
