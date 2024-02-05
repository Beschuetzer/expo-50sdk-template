import { Dimensions, StyleSheet } from "react-native";
import { ReduxViewer } from "@/components/stateTesting/ReduxViewer";
import { Playground } from "@/components/Playground";
import { AsyncStorageViewer } from "@/components/stateTesting/AsyncStorageViewer";
import { Center } from "native-base";
import { FlashList } from "@shopify/flash-list";
import { ItemsList } from "@/components/lists/ItemsList";

export default function TabOneScreen() {
  const windowDimensions = Dimensions.get("window");

  return (
    <FlashList
      estimatedItemSize={windowDimensions.height / 2}
      data={[
        {
          jsx: (
            <Center>
              <ReduxViewer />
              <AsyncStorageViewer />
              <ItemsList />
              <Playground />
            </Center>
          ),
          key: 1,
        } as { jsx: any },
      ]}
      renderItem={(info) => {
        return info.item.jsx;
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
