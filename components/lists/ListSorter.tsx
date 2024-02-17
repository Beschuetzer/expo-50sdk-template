import { Picker } from '@react-native-picker/picker'
import { Button, FormControl, Row, Stack, useTheme, Text } from 'native-base'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Dialog from 'react-native-dialog'
import { useDispatch } from 'react-redux'

import { SORT_TYPE_DESCRIPTIONS, SortType } from './sorters'

import { FORM_INTER_ITEM_SPACING } from '@/constants/general'
import {
  SortListPayload,
  SortOrderValue,
  toggleSortOrder,
} from '@/state/slices/listsSlice'
import { HeadingTagProp } from '@/types/general'

export type ListSortViewSize = 'large' | 'small'
type ListSorterProps = {
  isVisible: boolean
  onMount?: () => void
  onUnmount?: () => void
  onValueChange: (SortType: SortType) => void
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
  sortOrderValue: SortOrderValue
  sortTypes: SortType[]
  viewSize?: ListSortViewSize
} & HeadingTagProp &
  Pick<SortListPayload, 'listName'>

export function ListSorter(props: ListSorterProps) {
  const {
    headingTag: Tag = FormControl.Label,
    isVisible,
    listName,
    onMount,
    onUnmount,
    onValueChange,
    setIsVisible,
    sortOrderValue,
    sortTypes,
    viewSize = 'large',
  } = props
  const ref = useRef<Picker<SortType>>(null)
  const defaultSortType = useMemo(
    () => sortTypes?.[0] || SortType.None,
    [sortTypes],
  )
  const [selectedSortType, setSelectedSortType] = useState(defaultSortType)
  const theme = useTheme()
  const dispatch = useDispatch()

  const onCloseModal = useCallback(() => {
    setIsVisible && setIsVisible(false)
  }, [setIsVisible])

  const onSortTypePress = useCallback(
    (sortType: SortType) => {
      setSelectedSortType(sortType)
      onValueChange && onValueChange(sortType)
    },
    [onValueChange],
  )

  useEffect(() => {
    onMount && onMount()
    return () => {
      onUnmount && onUnmount()
    }
  }, [])

  return (
    <Dialog.Container visible={isVisible} onBackdropPress={onCloseModal}>
      <Dialog.Title style={{ textAlign: 'center' }}>
        Sort {sortOrderValue.sortOrder} By
      </Dialog.Title>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        {viewSize === 'large' ? (
          <>
            <Row pl={theme.space[1]}>
              <Tag>Sort By: </Tag>
            </Row>
            <Picker
              ref={ref}
              selectedValue={selectedSortType}
              onValueChange={onSortTypePress}
            >
              {sortTypes.map((sortType) => (
                <Picker.Item key={sortType} label={sortType} value={sortType} />
              ))}
            </Picker>
          </>
        ) : (
          <>
            <Button
              variant="subtle"
              onPress={() => dispatch(toggleSortOrder({ listName }))}
            >
              Toggle Order
            </Button>
            {sortTypes.map((sortType) => (
              <Button
                variant="ghost"
                key={sortType}
                onPress={() => onSortTypePress(sortType)}
              >
                {SORT_TYPE_DESCRIPTIONS[sortType]}
              </Button>
            ))}
          </>
        )}
      </Stack>
      <Stack mt={theme.space[1]}>
        <Text>
          Currently{' '}
          <Text fontWeight={900}>{sortOrderValue.sortOrder.toLowerCase()}</Text> by{' '}
          <Text fontWeight={900}>
            {SORT_TYPE_DESCRIPTIONS[sortOrderValue.sortBy].toLowerCase()}
          </Text>
        </Text>
      </Stack>
      <Dialog.Button
        color={theme.colors.primary[900]}
        label="Close"
        onPress={onCloseModal}
      />
    </Dialog.Container>
  )
}
