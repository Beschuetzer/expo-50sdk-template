import { useNavigation } from 'expo-router'
import { Row, Column, Text } from 'native-base'
import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'

import { ImageRenderer } from '../ImageRenderer'

import { Routes } from '@/constants/navigation'
import { ItemProp } from '@/types/general'
import { getFrequencyValue } from '@/utils/helpers'

type ItemTileProps = ItemProp

export function ItemTile(props: ItemTileProps) {
  const navigation = useNavigation()
  const { item } = props
  const frequencyObj = useMemo(() => getFrequencyValue(item?.frequency), [item])

  return (
    <RectButton
      style={styles.rectButton}
      onPress={() => {
        navigation.navigate(Routes.ItemModal, {
          key: item.upc || item.name,
          showOverrideMsg: false,
        })
      }}
    >
      <Row space={2}>
        <ImageRenderer source={item.images[item.imageToUseIndex]} />
        <Column>
          <Text>{item.name}</Text>
          <Text>{item.upc}</Text>
          <Text>
            Frequency: {frequencyObj?.number} {frequencyObj?.timeSpan}
            {frequencyObj?.number > 1 ? 's' : ''}
          </Text>
          <Text>Unit: {item?.unit}</Text>
          <Text>Added: {new Date(item.addedDate).toLocaleString()}</Text>
          <Text>
            Updated: {new Date(item.lastUpdatedDate).toLocaleString()}
          </Text>
        </Column>
      </Row>
    </RectButton>
  )
}

const styles = StyleSheet.create({
  rectButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
})
