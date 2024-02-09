import { FlashList } from '@shopify/flash-list'
import { useNavigation } from 'expo-router'
import { Heading, View, Text, Row, useTheme, Column, Center } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'

//  To toggle LTR/RTL uncomment the next line
// I18nManager.allowRTL(true);

import { useDispatch, useSelector } from 'react-redux'

import { SwipeableRow } from './SwipeableRow'
import { ImageRenderer } from '../ImageRenderer'

import { EMPTY_STRING } from '@/constants/general'
import { Routes } from '@/constants/navigation'
import {
  itemsListArraySelector,
  removeItemsListItem,
} from '@/state/slices/listsSlice'
import { Item, Key } from '@/types/Item'
import { getKeyToUse } from '@/utils/helpers'

type Row = { item: Item; index: number }
type ItemsListProps = object

export function ItemsList(props: ItemsListProps) {
  const itemsList = useSelector(itemsListArraySelector)
  const theme = useTheme()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  return (
    <View>
      <Center>
        <Heading p={theme.sizes[2]}>Items List</Heading>
      </Center>
      <FlashList
        data={itemsList}
        renderItem={({ item, index }: Row) => {
          const keyToUse = {
            name: item.name,
            upc: item.upc,
          } as Key
          return (
            <SwipeableRow
              key={`${index}-${getKeyToUse({ name: item?.name || EMPTY_STRING, upc: item?.upc || EMPTY_STRING })}`}
              leftActions={[
                {
                  title: 'Add to Shopping List',
                  backgroundColor: theme.colors.primary[900],
                  onPress: () => alert('add'),
                },
              ]}
              rightActions={[
                {
                  title: 'Delete',
                  backgroundColor: theme.colors.red[900],
                  onPress: () => {
                    dispatch(removeItemsListItem(keyToUse))
                  },
                },
              ]}
            >
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
                    <Text>Frequency: {item.frequency}</Text>
                    <Text>Unit: {item?.unit}</Text>
                  </Column>
                </Row>
              </RectButton>
            </SwipeableRow>
          )
        }}
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
