import { ReduxViewer } from "@/components/stateTesting/ReduxViewer";
import { Playground } from "@/components/Playground";
import { AsyncStorageViewer } from "@/components/stateTesting/AsyncStorageViewer";
import { ScrollView } from "native-base";
import { ItemsList } from "@/components/lists/ItemsList";

export default function TabOneScreen() {

  return (
    <ScrollView p={2}>
      <ReduxViewer />
      <AsyncStorageViewer />
      <ItemsList />
      <Playground />
    </ScrollView>
  );
}