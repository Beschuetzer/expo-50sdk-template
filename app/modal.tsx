import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import { UpcDetailsForm } from "@/components/UpcDetailsForm";
import { ReduxViewer } from "@/components/stateTesting/ReduxViewer";

export default function ModalScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.container}>
      <UpcDetailsForm
        upcProduct={route.params?.upcProduct || {}}
        onClose={() => navigation.goBack()}
      />
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
