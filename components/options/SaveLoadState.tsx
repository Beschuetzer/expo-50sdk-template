import { FontAwesome } from '@expo/vector-icons'
import { Row, useTheme, Stack, FormControl } from 'native-base'
import React, { useCallback, useMemo } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

import { FORM_INTER_ITEM_SPACING } from '@/constants/general'
import {
  itemsListSelector,
  setItemsList,
  setStoresList,
  storesListSelector,
} from '@/state/slices/listsSlice'
import { loadAppStateFromFile, saveAppStateToFile } from '@/utils/helpers'

type SaveLoadStateProps = object

const FILE_NAMES = {
  items: 'items',
  stores: 'stores',
}

export const SaveLoadState = (props: SaveLoadStateProps) => {
  const theme = useTheme()
  const items = useSelector(itemsListSelector)
  const stores = useSelector(storesListSelector)
  const dispatch = useDispatch()
  const iconSize = useMemo(() => theme.sizes[6], [theme])

  const onLoadItemsPress = useCallback(async () => {
    const itemsLoaded = await loadAppStateFromFile(FILE_NAMES.items)
    dispatch(setItemsList(itemsLoaded))
  }, [])

  const onSaveItemsPress = useCallback(async () => {
    await saveAppStateToFile(FILE_NAMES.items, items)
  }, [items])

  const onLoadStoresPress = useCallback(async () => {
    const storesLoaded = await loadAppStateFromFile(FILE_NAMES.stores)
    dispatch(setStoresList(storesLoaded))
  }, [])

  const onSaveStoresPress = useCallback(async () => {
    await saveAppStateToFile(FILE_NAMES.stores, stores)
  }, [items])

  return (
    <Stack space={theme.space[FORM_INTER_ITEM_SPACING]}>
      <Row space={theme.space[5]} alignItems="center">
        <FormControl.Label>Items:</FormControl.Label>
        <TouchableOpacity onPress={onLoadItemsPress}>
          <FontAwesome name="download" size={iconSize} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSaveItemsPress}>
          <FontAwesome name="save" size={iconSize} />
        </TouchableOpacity>
      </Row>
      <Row space={theme.space[5]} alignItems="center">
        <FormControl.Label>Stores:</FormControl.Label>
        <TouchableOpacity onPress={onLoadStoresPress}>
          <FontAwesome name="download" size={iconSize} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSaveStoresPress}>
          <FontAwesome name="save" size={iconSize} />
        </TouchableOpacity>
      </Row>
    </Stack>
  )
}
