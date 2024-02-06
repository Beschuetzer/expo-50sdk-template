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
        <Text>Cached Image:</Text>
        <ImageRenderer imageUri={item.imageUri?.location} />
        <Text>{item.imageUri?.location}</Text>
      </Row>
      <Row>
        <Text>Web Image:</Text>
        <ImageRenderer imageUri={item.imageUri?.url} />
        <Text>{item.imageUri?.url}</Text>
      </Row>
    </View>
  )
}
