import { FlashList, ListRenderItemInfo } from '@shopify/flash-list'
import { View, Text, useTheme, Heading, FlatList, Row } from 'native-base'
import { useSelector } from 'react-redux'

import { itemsListArraySelector } from '@/state/slices/listsSlice'
import { Item } from '@/types/Item'
import { ImageRenderer } from '../ImageRenderer'

export function ItemsList() {
  const itemsList = useSelector(itemsListArraySelector)
  const theme = useTheme()

  function renderItem(value: ListRenderItemInfo<Item>) {
    const { index, item } = value

    return (
      <View key={index} borderColor={theme.colors.black} borderWidth={2}>
        <Text>item.name: {item.name}</Text>
        <Text>item.upc: {item.upc}</Text>
        <Text>item.frequency: {item.frequency}</Text>
        <Row>
          <Text>Cached Image:</Text>
          <ImageRenderer imageUri={item.imageUri?.location} />
        </Row>
        <Row>
          <Text>Web Image:</Text>
          <ImageRenderer imageUri={item.imageUri?.url} />
        </Row>
      </View>
    )
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
  )
}

