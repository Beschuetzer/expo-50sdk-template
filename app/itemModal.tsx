import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Center, theme, Heading, Text } from "native-base";
import { ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";

import { ItemForm } from "@/components/ItemForm";
import { useUpcProduct } from "@/components/useUpcData";
import { addItemsListItem } from "@/state/slices/listsSlice";
import { getItem } from "@/utils/model-mappings";

export default function ItemModal() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { upc, showOverrideMsg } = route.params as any
  const { upcProduct, errorMsg } = useUpcProduct({
    upc,
  });

  function renderContent() {
    if (upcProduct) {
      return (
        <ItemForm
          onClose={() => navigation.canGoBack() && navigation.goBack()}
          onSave={(item) => {
            dispatch(addItemsListItem(item))
          }}
          item={getItem(upcProduct)}
          showOverrideMsg={showOverrideMsg}
        />
      )
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
