import { ReduxViewer } from "@/components/stateTesting/ReduxViewer";
import { Playground } from "@/components/Playground";
import { AsyncStorageViewer } from "@/components/stateTesting/AsyncStorageViewer";
import { Center } from "native-base";
import { ItemsList } from "@/components/lists/ItemsList";

export default function TabOneScreen() {

  return (
    <Center>
      <ReduxViewer />
      <AsyncStorageViewer />
      <ItemsList />
      <Playground />
    </Center>
  );
}