import { ScrollView } from "native-base";

import { Playground } from "@/components/Playground";
import { ItemsList } from "@/components/lists/ItemsList";
import { ReduxViewer } from "@/components/stateTesting/ReduxViewer";

export default function TabOneScreen() {
  return (
    <ScrollView py={2} keyboardShouldPersistTaps="always">
      <ReduxViewer />
      <ItemsList />
      <Playground />
    </ScrollView>
  )
}

