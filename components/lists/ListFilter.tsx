import { useTheme } from 'native-base'
import { useCallback, useEffect, useRef, useState } from 'react'
import Dialog from 'react-native-dialog'

import { EMPTY_STRING } from '@/constants/general'

export type ListSortViewSize = 'large' | 'small'
type ListFilterProps = {
  debounceTimeout?: number
  isVisible: boolean
  filterStringInitial?: string
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
  onMount?: () => void
  onUnmount?: () => void
  onValueChange: (filter: string) => void
}

export function ListFilter(props: ListFilterProps) {
  const {
    debounceTimeout = 500,
    filterStringInitial = EMPTY_STRING,
    isVisible,
    setIsVisible,
    onMount,
    onUnmount,
    onValueChange,
  } = props
  const [inputValue, setInputValue] = useState(filterStringInitial)
  const theme = useTheme()
  const debounceRef = useRef<any>(-1)

  const onCloseModal = useCallback(() => {
    setIsVisible && setIsVisible(false)
  }, [setIsVisible])

  const onChangeText = useCallback(
    (filterValue: string) => {
      setInputValue(filterValue)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onValueChange && onValueChange(filterValue)
      }, debounceTimeout)
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
      <Dialog.Title style={{ textAlign: 'center' }}>Filter</Dialog.Title>
      <Dialog.Input
        value={inputValue}
        onChangeText={onChangeText}
        placeholder="Term or regular expression"
      />
      <Dialog.Button
        color={theme.colors.primary[900]}
        label="Close"
        onPress={onCloseModal}
      />
    </Dialog.Container>
  )
}
