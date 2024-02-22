import { Row, useTheme, Button } from 'native-base'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { itemsListSelector } from '@/state/slices/listsSlice'

type SaveLoadStateProps = object

export const SaveLoadState = (props: SaveLoadStateProps) => {
  const {} = props
  const theme = useTheme()
  const items = useSelector(itemsListSelector)

  const onLoadItemsPress = useCallback(() => {
    console.log('loading')
  }, [])

  const onSaveItemsPress = useCallback(() => {
    console.log('saving')
  }, [])

  return (
    <Row space={theme.space[1]}>
      <Button onPress={onLoadItemsPress}>Load Items</Button>
      <Button onPress={onSaveItemsPress}>Save Items</Button>
    </Row>
  )
}
