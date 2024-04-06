import { useTheme, Text, View } from 'native-base';
import { useCallback, useEffect, useRef, useState } from 'react';
import Dialog from 'react-native-dialog';
import { useDispatch } from 'react-redux';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { ListName, resetListToDisplayFilters } from '@/state/slices/listsSlice';
import { List } from '@/types/Item';

export type ListFilterFilters<T> = Partial<Record<keyof T, string>>;

type ListFilterProps<T> = {
  debounceTimeout?: number;
  filterNames: (keyof T)[];
  isVisible: boolean;
  list: List<T>;
  listName: ListName;
  onMount?: () => void;
  onUnmount?: () => void;
  onValueChange: (filters: ListFilterFilters<T>) => void;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ListFilter<T>(props: ListFilterProps<T>) {
  const {
    debounceTimeout = 500,
    filterNames,
    list,
    listName,
    isVisible,
    onMount,
    onUnmount,
    onValueChange,
    setIsVisible,
  } = props;
  const [filters, setFilters] = useState<ListFilterFilters<T> | null>(
    list.filters,
  );
  const theme = useTheme();
  const debounceRef = useRef<any>(-1);
  const dispatch = useDispatch();

  const onClearPress = useCallback(() => {
    dispatch(resetListToDisplayFilters({ listName }));
  }, []);

  const onCloseModal = useCallback(() => {
    setIsVisible && setIsVisible(false);
  }, [setIsVisible]);

  const onChange = useCallback(
    (key: keyof T, value: string) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }));
    },
    [onValueChange],
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onValueChange && onValueChange(filters || {});
    }, debounceTimeout);
  }, [filters]);

  useEffect(() => {
    onMount && onMount();
    return () => {
      onUnmount && onUnmount();
    };
  }, []);

  useEffect(() => {
    setFilters(list.filters);
  }, [list]);

  return (
    <Dialog.Container visible={isVisible} onBackdropPress={onCloseModal}>
      <Dialog.Title style={{ textAlign: 'center' }}>Filter</Dialog.Title>
      {filterNames.map((filterName: keyof T) => {
        return (
          <View key={filterName?.toString()}>
            <Text ml={theme.space[FORM_INTER_ITEM_SPACING]}>
              {filterName.toString()}
            </Text>
            <Dialog.Input
              value={filters?.[filterName] || EMPTY_STRING}
              onChangeText={(value) => onChange(filterName, value)}
              placeholder="Term or regular expression"
            />
          </View>
        );
      })}
      <Dialog.Button
        color={theme.colors.primary[900]}
        label="Clear"
        onPress={onClearPress}
      />
      <Dialog.Button
        color={theme.colors.primary[900]}
        label="Close"
        onPress={onCloseModal}
      />
    </Dialog.Container>
  );
}
