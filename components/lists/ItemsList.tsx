import { FontAwesome } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useNavigation } from 'expo-router'
import {
  Heading,
  View,
  Text,
  Row,
  useTheme,
  Column,
  Center,
  Stack,
} from 'native-base'
import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'

//  To toggle LTR/RTL uncomment the next line
// I18nManager.allowRTL(true);

import { useDispatch, useSelector } from 'react-redux'

import { SwipeableRow } from './SwipeableRow'
import { ImageRenderer } from '../ImageRenderer'

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general'
import { Routes } from '@/constants/navigation'
import {
  currentStoreSelector,
  itemsListArraySelector,
  itemsListSelector,
  removeItemsListItem,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice'
import { Item, ItemWithStoreSpecificValues, Key } from '@/types/Item'
import { ListRow } from '@/types/general'
import { getKeyToUse } from '@/utils/helpers'

type ItemsListProps = object

export function ItemsList(props: ItemsListProps) {
  const itemsListArray = useSelector(itemsListArraySelector)
  const itemsList = useSelector(itemsListSelector)
  const currentStore = useSelector(currentStoreSelector)
  const theme = useTheme()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const onSwipeRight = useCallback(
    (key: Key) => {
      const keyToUse = getKeyToUse(key)
      const currentQuantity =
        itemsList?.[keyToUse as any]?.quantity?.[currentStore.name]
      console.log({
        keyToUse,
        quantity: itemsList?.[keyToUse as any]?.quantity,
        currentQuantity,
        currentStore,
      })

      dispatch(
        updateStoreSpecificValues({
          key,
          storeSpecificValuesToUpdate: {
            quantity:
              currentQuantity && currentQuantity > 0 ? currentQuantity + 1 : 1,
          },
          storeName: currentStore.name,
        }),
      )
    },
    [currentStore, itemsList, updateStoreSpecificValues],
  )

  const onSwipeLeft = useCallback((key: Key) => {
    dispatch(removeItemsListItem(key))
  }, [])

  return (
    <View>
      <Center>
        <Heading p={theme.sizes[2]}>Items List</Heading>
      </Center>
      <FlashList
        data={itemsListArray}
        renderItem={({ item, index }: ListRow<ItemWithStoreSpecificValues>) => {
          const key = {
            name: item.name,
            upc: item.upc,
          } as Key
          return (
            <SwipeableRow
              key={`${index}-${getKeyToUse({ name: item?.name || EMPTY_STRING, upc: item?.upc || EMPTY_STRING })}`}
              leftSwipe={{
                title: (
                  <Stack paddingRight={theme.space[2]} alignItems="center">
                    <FontAwesome
                      name="trash"
                      color={theme.colors.white}
                      size={theme.sizes[8]}
                    />
                  </Stack>
                ),
                backgroundColor: theme.colors.red[900],
                onPress: onSwipeLeft.bind(null, key),
              }}
              rightSwipe={{
                backgroundColor: theme.colors.primary[900],
                onPress: onSwipeRight.bind(null, key),
                title: currentStore.name ? (
                  <Stack
                    paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
                    alignItems="center"
                  >
                    <FontAwesome
                      name="plus"
                      color={theme.colors.white}
                      size={theme.sizes[8]}
                    />
                    <Text color={theme.colors.white}>Shopping List</Text>
                  </Stack>
                ) : (
                  <Text
                    width={150}
                    numberOfLines={2}
                    paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
                    color={theme.colors.white}
                  >
                    Select a Store to Add to Shopping List
                  </Text>
                ),
              }}
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
        keyExtractor={(item: ItemWithStoreSpecificValues, index: number) =>
          `item ${index}`
        }
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
