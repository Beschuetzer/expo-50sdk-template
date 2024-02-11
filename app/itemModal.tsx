import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Center, theme, Heading, Text } from "native-base";
import { ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { ItemForm } from "@/components/forms/ItemForm";
import { useUpcProduct } from "@/components/hooks/useUpcProduct";
import {
  AddItemsListItemPayload,
  addItemsListItem,
  itemsListItemSelector,
} from "@/state/slices/listsSlice";
import { getItem } from "@/utils/model-mappings";

export default function ItemModal() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { key, showOverrideMsg } = (route.params || {}) as any;
  const { upcProduct, errorMsg } = useUpcProduct({
    upc: key,
  });
  const itemInList = useSelector(itemsListItemSelector(key));

  function renderContent() {
    if (upcProduct) {
      const item = getItem(upcProduct);
      if (itemInList) {
        item.images = itemInList.images;
        item.imageToUseIndex = itemInList.imageToUseIndex;
      }

      return (
        <ItemForm
          onClose={() => navigation.canGoBack() && navigation.goBack()}
          onSave={(addItemsListItemPayload: AddItemsListItemPayload) => {
            dispatch(addItemsListItem(addItemsListItemPayload));
          }}
          item={item}
          showOverrideMsg={showOverrideMsg}
        />
      );
    }
    return (
      <Center height="100%">
        {errorMsg ? (
          <>
            <Heading>Error Fetching Data</Heading>
            <Text>{errorMsg}</Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={theme.colors.black} />
            <Text>Checking for Upc data...</Text>
          </>
        )}
      </Center>
    );
  }

  return renderContent();
}
