import { useTheme, Text } from 'native-base'
import { useCallback, useEffect, useRef, useState } from 'react'
import Dialog from 'react-native-dialog'

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general'
import { ItemWithStoreSpecificValues } from '@/types/Item'

export type ListFilterFilters<T> = Partial<
  Record<keyof ItemWithStoreSpecificValues, string>
>

type ListFilterProps<T> = {
  item: T
  debounceTimeout?: number
  filterNames: (keyof T)[]
  isVisible: boolean
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
  onMount?: () => void
  onUnmount?: () => void
  onValueChange: (filters: ListFilterFilters<T>) => void
}

export function ListFilter<T>(props: ListFilterProps<T>) {
  const {
    debounceTimeout = 500,
    filterNames,
    isVisible,
    setIsVisible,
    onMount,
    onUnmount,
    onValueChange,
  } = props
  const [filters, setFilters] = useState<ListFilterFilters<T>>({})
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
          <>
            <Text ml={theme.space[FORM_INTER_ITEM_SPACING]}>
              {filterName.toString()}
            </Text>
            <Dialog.Input
              value={filters[filterName] || EMPTY_STRING}
              onChangeText={(value) => onChange(filterName, value)}
              placeholder="Term or regular expression"
            />
          </>
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
