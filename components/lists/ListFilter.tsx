import { useTheme, Text, View } from 'native-base'
import { useCallback, useEffect, useRef, useState } from 'react'
import Dialog from 'react-native-dialog'
import { useSelector } from 'react-redux'

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general'
import { SetFiltersPayload, filterSelector } from '@/state/slices/listsSlice'

export type ListFilterFilters<T> = Partial<Record<keyof T, string>>

type ListFilterProps<T> = {
  item: T
  debounceTimeout?: number
  filterNames: (keyof T)[]
  isVisible: boolean
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
  onMount?: () => void
  onUnmount?: () => void
  onValueChange: (filters: ListFilterFilters<T>) => void
} & Pick<SetFiltersPayload, 'listName'>

export function ListFilter<T>(props: ListFilterProps<T>) {
  const {
    debounceTimeout = 500,
    listName,
    filterNames,
    isVisible,
    setIsVisible,
    onMount,
    onUnmount,
    onValueChange,
  } = props
  const filtersFound = useSelector(filterSelector(listName))
  const [filters, setFilters] = useState<ListFilterFilters<T>>(filtersFound)
  const theme = useTheme()
  const debounceRef = useRef<any>(-1)

  const onCloseModal = useCallback(() => {
    setIsVisible && setIsVisible(false)
  }, [setIsVisible])

  const onChange = useCallback(
    (key: keyof T, value: string) => {
      console.log({ value, key })
      setFilters((current) => ({
        ...current,
        [key]: value,
      }))
    },
    [onValueChange],
  )

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onValueChange && onValueChange(filters)
    }, debounceTimeout)
  }, [filters])

  useEffect(() => {
    onMount && onMount()
    return () => {
      onUnmount && onUnmount()
    }
  }, [])

  return (
    <Dialog.Container visible={isVisible} onBackdropPress={onCloseModal}>
      <Dialog.Title style={{ textAlign: 'center' }}>Filter</Dialog.Title>
      {filterNames.map((filterName: keyof T) => {
        return (
          <View key={filterName}>
            <Text ml={theme.space[FORM_INTER_ITEM_SPACING]}>
              {filterName.toString()}
            </Text>
            <Dialog.Input
              value={filters[filterName] || EMPTY_STRING}
              onChangeText={(value) => onChange(filterName, value)}
              placeholder="Term or regular expression"
            />
          </View>
        )
      })}
      <Dialog.Button
        color={theme.colors.primary[900]}
        label="Close"
        onPress={onCloseModal}
      />
    </Dialog.Container>
  )
}
