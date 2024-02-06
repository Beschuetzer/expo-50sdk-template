import { FlashList, ListRenderItemInfo } from '@shopify/flash-list'
import { View, useTheme, Heading } from 'native-base'
import { useSelector } from 'react-redux'

import { itemsListArraySelector } from '@/state/slices/listsSlice'
import { Item } from '@/types/Item'
import { ItemsListItem } from './ItemsListItem'

export function ItemsList() {
  const itemsList = useSelector(itemsListArraySelector)

  function renderItem(value: ListRenderItemInfo<Item>) {
    const { index, item } = value

    return <ItemsListItem index={index} item={item} />
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

