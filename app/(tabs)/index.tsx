import { ScrollView } from "native-base";
import { useDispatch } from "react-redux";

import { Playground } from "@/components/Playground";
import { StoreManager } from "@/components/StoreManager";
import { useGpsCoordinate } from "@/components/hooks/useGeoLocation";
import { ItemsList } from "@/components/lists/ItemsList";
import { ShoppingList } from "@/components/lists/ShoppingLIst";
import { ReduxViewer } from "@/components/mocks/ReduxViewer";
import { setCurrentLocation } from "@/state/slices/listsSlice";

export default function TabOneScreen() {
  const dispatch = useDispatch();
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => {
      dispatch(setCurrentLocation(gpsCoordinate));
    },
  });

  return (
    <ScrollView py={2} keyboardShouldPersistTaps="always">
      <ReduxViewer />
      <StoreManager showAddStore showStoreList />
      {/* <ShoppingList /> */}
      {/* <ItemsList /> */}
      {/* <Playground /> */}
    </ScrollView>
  );
}
