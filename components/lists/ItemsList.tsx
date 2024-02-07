import { FlashList } from '@shopify/flash-list'
import { Heading, View, Text, Row, useTheme } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'

//  To toggle LTR/RTL uncomment the next line
// I18nManager.allowRTL(true);

import { useSelector } from 'react-redux'

import { SwipeableRow } from './SwipeableRow'

import { itemsListArraySelector } from '@/state/slices/listsSlice'
import { Item } from '@/types/Item'
import { ImageRenderer } from '../ImageRenderer'


type Row = { item: Item; index: number };
const RectRow = ({ item, index }: Row) => (
  <RectButton style={styles.rectButton} onPress={() => alert('click 1')}>
    <View>
      <ImageRenderer source={item.imageUri} />
      <Text>{item.imageUri}</Text>
    </View>
  </RectButton>
)

const SwipeableRowLocal = ({ item, index }: Row) => {
  return (
    <SwipeableRow>
      <RectRow item={item} index={index}/>
    </SwipeableRow>
  )
}

type ItemsListProps = {}
export function ItemsList(props: ItemsListProps) {
  const itemsList = useSelector(itemsListArraySelector)
  const theme = useTheme()

  return (
    <View>
      <Heading>Items List</Heading>
      <FlashList
        data={itemsList}
        renderItem={({ item, index }: Row) => (
          <SwipeableRowLocal key={index} item={item} index={index} />
        )}
        keyExtractor={(item: Item, index: number) => `item ${index}`}
        estimatedItemSize={60} //todo: caculate this approriately
        ItemSeparatorComponent={() => (
          <View
            height={StyleSheet.hairlineWidth}
            backgroundColor={theme.colors.gray[500]}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  rectButton: {
    flex: 1,
    // height: 80,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  fromText: {
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  messageText: {
    color: '#999',
    backgroundColor: 'transparent',
  },
  dateText: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 20,
    top: 10,
    color: '#999',
    fontWeight: 'bold',
  },
})
