import { useNavigation } from "expo-router";
import { useDispatch } from "react-redux";

import { StoreForm } from "@/components/forms/StoreForm";
import { addStoresListItem } from "@/state/slices/listsSlice";

export default function StoreScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  return (
    <StoreForm
      onClose={() => navigation.canGoBack() && navigation.goBack()}
      onSave={(store) => {
        dispatch(addStoresListItem(store));
      }}
    />
  );
}
