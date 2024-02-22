import { FontAwesome } from '@expo/vector-icons'
import { Row, useTheme, Stack, FormControl } from 'native-base'
import React, { useCallback, useMemo } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

import { FORM_INTER_ITEM_SPACING } from '@/constants/general'
import { itemsListSelector, setItemsList } from '@/state/slices/listsSlice'
import { loadAppStateFromFile, saveAppStateToFile } from '@/utils/helpers'

type SaveLoadStateProps = object

const FILE_NAMES = {
  items: 'items'
}

export const SaveLoadState = (props: SaveLoadStateProps) => {
  const {} = props
  const theme = useTheme()
  const items = useSelector(itemsListSelector)
  const dispatch = useDispatch();
  const iconSize = useMemo(() => theme.sizes[6], [theme])

  const onLoadItemsPress = useCallback(async () => {
    const itemsLoaded = await loadAppStateFromFile(FILE_NAMES.items)
    console.log({itemsLoaded});
    dispatch(setItemsList(itemsLoaded))
    //todo:
  }, [])

  const onSaveItemsPress = useCallback(async () => {
    
    await saveAppStateToFile(FILE_NAMES.items, items)
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
    </Stack>
  )
}
