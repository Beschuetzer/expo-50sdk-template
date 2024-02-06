import { itemsListArraySelector } from "@/state/slices/listsSlice";
import { Item } from "@/types/Item";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { View, Text, useTheme, Heading, FlatList } from "native-base";
import { useSelector } from "react-redux";

export function ItemsList() {
  const itemsList = useSelector(itemsListArraySelector);
  const theme = useTheme();
  
  function renderItem(value: ListRenderItemInfo<Item>) {
    const { index, item } = value;

    return (
      <View key={index} borderColor={theme.colors.black} borderWidth={2}>
        <Text>item.name: {item.name}</Text>
        <Text>item.upc: {item.upc}</Text>
        <Text>item.frequency: {item.frequency}</Text>
        <Text>item.imageUri.location: {item.imageUri?.location}</Text>
        <Text>item.imageUri.url: {item.imageUri?.url}</Text>
      </View>
    );
  }

  return (
    <View>
      <Heading>Items List</Heading>
      <FlashList
        data={Object.values(itemsList)}
        renderItem={renderItem}
        estimatedItemSize={60} //todo: caculate this approriately
      />
    </View>
  );
}
