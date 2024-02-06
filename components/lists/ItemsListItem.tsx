import { Row, View, theme, Text } from 'native-base'

import { ImageRenderer } from '../ImageRenderer'

import { Item } from '@/types/Item'

type ItemsListItemProps = {
  index: number | string
  item: Item
}

export function ItemsListItem(props: ItemsListItemProps) {
  const { index, item } = props;

  return (
    <View key={index} borderColor={theme.colors.black} borderWidth={2}>
      <Text>item.name: {item.name}</Text>
      <Text>item.upc: {item.upc}</Text>
      <Text>item.frequency: {item.frequency}</Text>
      <Row>
        <ImageRenderer source={item.imageUri} />
        <Text>{item.imageUri}</Text>
      </Row>
    </View>
  )
}
