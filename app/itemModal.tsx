import { useRoute } from '@react-navigation/native'
import { useNavigation } from 'expo-router'
import { Center, theme, Heading, Text } from 'native-base'
import { useMemo } from 'react'
import { ActivityIndicator } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { ItemForm } from '@/components/forms/ItemForm'
import { useUpcProduct } from '@/components/hooks/useUpcProduct'
import { EMPTY_STRING } from '@/constants/general'
import {
  AddItemsListItemPayload,
  addItemsListItem,
  currentStoreSelector,
  itemsListItemSelector,
} from '@/state/slices/listsSlice'
import { UpcProduct } from '@/types/UpcResponse'
import { getItem } from '@/utils/model-mappings'

export default function ItemModal() {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const route = useRoute()
  const { key, showOverrideMsg } = (route.params || {}) as any
  const { upcProduct, errorMsg } = useUpcProduct({
    upc: key,
  })
  const itemInList = useSelector(itemsListItemSelector(key || EMPTY_STRING))
  const currentStore = useSelector(currentStoreSelector)
  const fallbackItem = useMemo(() => getItemFromUpc(upcProduct), [upcProduct])
  const itemInListUsingName = useSelector(
    itemsListItemSelector(fallbackItem?.name || EMPTY_STRING),
  )

  function getItemFromUpc(upcProduct: UpcProduct | null) {
    const item = getItem(upcProduct)
    if (itemInList) {
      item.images = itemInList.images
      item.imageToUseIndex = itemInList.imageToUseIndex
    }
    return item
  }

  function renderContent() {
    if (!upcProduct && !itemInList) {
      return (
        <Center height="100%">
          {errorMsg ? (
            <>
              <Heading>Error Fetching Data</Heading>
              <Text>{errorMsg}</Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={theme.colors.black} />
              <Text>Checking for Upc data...</Text>
            </>
          )}
        </Center>
      )
    }
    return (
      <ItemForm
        onClose={() => navigation.canGoBack() && navigation.goBack()}
        onSave={(addItemsListItemPayload: AddItemsListItemPayload) => {
          dispatch(addItemsListItem(addItemsListItemPayload))
        }}
        item={fallbackItem}
        itemInListUsingName={itemInListUsingName}
        itemInList={itemInList}
        currentStore={currentStore}
        showOverrideMsg={showOverrideMsg}
      />
    )
  }

  return renderContent()
}
