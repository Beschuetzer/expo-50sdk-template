import { FlashList } from '@shopify/flash-list'
import { Heading, View, Text, Row, useTheme, Column, Center } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'

//  To toggle LTR/RTL uncomment the next line
// I18nManager.allowRTL(true);

import { useDispatch, useSelector } from 'react-redux'

import { SwipeableRow } from './SwipeableRow'

import { itemsListArraySelector } from '@/state/slices/listsSlice'
import { Item } from '@/types/Item'
import { ImageRenderer } from '../ImageRenderer'
import { setLastUpcScanned, setUpcProductToDisplay } from '@/state/slices/generalSlice'

type Row = { item: Item; index: number }
type ItemsListProps = {}

export function ItemsList(props: ItemsListProps) {
  const itemsList = useSelector(itemsListArraySelector)
  const theme = useTheme();
  const dispatch = useDispatch();

  return (
    <View>
      <Center>
        <Heading p={theme.sizes[2]}>Items List</Heading>
      </Center>
      <FlashList
        data={itemsList}
        renderItem={({ item, index }: Row) => (
          <SwipeableRow>
            <RectButton
              style={styles.rectButton}
              onPress={() => dispatch(setLastUpcScanned(item.upc || item.name || ""))}
            >
              <Row space={2}>
                <ImageRenderer source={item.imageUri} />
                <Column>
                  <Text>{item.name}</Text>
                  <Text>{item.upc}</Text>
                  <Text>{item.frequency}</Text>
                </Column>
              </Row>
            </RectButton>
          </SwipeableRow>
        )}
        keyExtractor={(item: Item, index: number) => `item ${index}`}
        estimatedItemSize={180} //todo: caculate this approriately
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
    paddingVertical: 10,
    paddingHorizontal: 10,
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
