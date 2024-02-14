import { Picker } from '@react-native-picker/picker'
import {
  Button,
  FormControl,
  Row,
  Stack,
  useTheme,
} from 'native-base'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SortType } from './sorters'

import { FORM_INTER_ITEM_SPACING } from '@/constants/general'
import { HeadingTagProp } from '@/types/general'

export type ListSortViewSize = 'large' | 'small'
type ListSorterProps = {
  onMount?: () => void
  onUnmount?: () => void
  onValueChange: (SortType: SortType) => void
  sortTypes: SortType[]
  viewSize?: ListSortViewSize
} & HeadingTagProp

export function ListSorter(props: ListSorterProps) {
  const {
    onMount,
    onUnmount,
    onValueChange,
    sortTypes,
    headingTag: Tag = FormControl.Label,
    viewSize = 'large',
  } = props
  const ref = useRef<Picker<SortType>>(null)
  const defaultSortType = useMemo(
    () => sortTypes?.[0] || SortType.None,
    [sortTypes],
  )
  const [selectedSortType, setSelectedSortType] = useState(defaultSortType)
  const theme = useTheme()

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
          {sortTypes.map((sortType) => (
            <Button
              variant="ghost"
              key={sortType}
              onPress={() => onSortTypePress(sortType)}
            >
              {sortType}
            </Button>
          ))}
        </>
      )}
    </Stack>
  )
}
