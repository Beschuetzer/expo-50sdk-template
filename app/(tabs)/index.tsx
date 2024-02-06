import { ScrollView } from "native-base";

import { Playground } from "@/components/Playground";
import { ItemsList } from "@/components/lists/ItemsList";
import { ReduxViewer } from "@/components/stateTesting/ReduxViewer";
import SwipeableList from "@/components/swipeable/SwipeableList";

export default function TabOneScreen() {
  return (
    <ScrollView p={2} keyboardShouldPersistTaps="always">
      <ReduxViewer />
      <ItemsList />
      <SwipeableList />
      <Playground />
    </ScrollView>
  )
}

