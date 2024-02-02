import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import { ReduxViewer } from "@/components/stateTesting/ReduxViewer";
import { Playground } from "@/components/Playground";
import { UpcDetailsSheet } from "@/components/UpcDetailsSheet";

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <ReduxViewer />
      <Playground />
      <UpcDetailsSheet />
    </View>
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
