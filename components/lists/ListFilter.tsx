import { useTheme, Text, View } from 'native-base'
import { useCallback, useEffect, useRef, useState } from 'react'
import Dialog from 'react-native-dialog'

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general'

export type ListFilterFilters<T> = Partial<Record<keyof T, string>>

type ListFilterProps<T> = {
  debounceTimeout?: number
  filterNames: (keyof T)[]
  filtersInitial: ListFilterFilters<T>
  isVisible: boolean
  item: T
  onMount?: () => void
  onUnmount?: () => void
  onValueChange: (filters: ListFilterFilters<T>) => void
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export function ListFilter<T>(props: ListFilterProps<T>) {
  const {
    debounceTimeout = 500,
    filterNames,
    filtersInitial = {},
    isVisible,
    onMount,
    onUnmount,
    onValueChange,
    setIsVisible,
  } = props
  const [filters, setFilters] = useState<ListFilterFilters<T> | null>(
    filtersInitial,
  )
  const theme = useTheme()
  const debounceRef = useRef<any>(-1)

  const onCloseModal = useCallback(() => {
    setIsVisible && setIsVisible(false)
  }, [setIsVisible])

  const onChange = useCallback(
    (key: keyof T, value: string) => {
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
      onValueChange && onValueChange(filters || {})
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
              value={filters?.[filterName] || EMPTY_STRING}
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
