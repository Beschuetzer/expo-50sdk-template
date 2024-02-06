import { ScrollView } from "native-base";

import { Playground } from "@/components/Playground";
import { ItemsList } from "@/components/lists/ItemsList";
import { ReduxViewer } from "@/components/stateTesting/ReduxViewer";

export default function TabOneScreen() {
  return (
    <ScrollView p={2}>
      <ReduxViewer />
      <ItemsList />
      <Playground />
    </ScrollView>
  );
}
