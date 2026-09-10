import { FontAwesome } from '@expo/vector-icons';
import { HStack, Input, InputField } from '@gluestack-ui/themed';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

import { getSorter, SortOrder, SortType } from './lists/sorters';

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  SORT_ORDER_VALUE_DEFAULT,
} from '@/constants/general';
import { Key } from '@/types/Task';
import { ChildrenProp } from '@/types/general';
import { getHash } from '@/utils/getHash';

export type ListFilterFilters<T> = Partial<Record<keyof T, string>>;

type FilterInputProps<T extends Key> = {
  debounceTimeout?: number;
  onFilterChange: (
    list: T[],
    filterValue: string,
    sortOrderValue: { sortOrder: SortOrder; sortBy: SortType },
  ) => void;
  list: T[];
  sortTypes?: SortType[];
  startingSortOrderValue?: { sortOrder: SortOrder; sortBy: SortType };
  swapElementOrder?: boolean;
  swapButtonOrder?: boolean;
} & ChildrenProp;

export default function FilterListInput<T extends Key>({
  children,
  debounceTimeout = 300,
  list,
  onFilterChange,
  sortTypes = Object.values(SortType).filter(
    (sortType) => sortType !== SortType.None,
  ),
  swapElementOrder = false,
  swapButtonOrder = false,
  startingSortOrderValue = SORT_ORDER_VALUE_DEFAULT,
}: FilterInputProps<T>) {
  const [filterValue, setFilterValue] = useState(EMPTY_STRING);
  const [valueToDisplay, setValueToDisplay] = useState(EMPTY_STRING);
  const [sortOrderValue, setSortOrderValue] = useState(startingSortOrderValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRenderRef = useRef<{
    listHash: number;
    listLength: number;
    filterValue: string;
    sortOrderValue: { sortBy: SortType; sortOrder: SortOrder };
  }>({
    listHash: EMPTY_NUMBER,
    listLength: EMPTY_NUMBER,
    filterValue: EMPTY_STRING,
    sortOrderValue: { sortBy: SortType.None, sortOrder: SortOrder.Ascending },
  });

  const onChangeText = useCallback(
    (newValue: string) => {
      setValueToDisplay(newValue);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setFilterValue(newValue);
      }, debounceTimeout);
    },
    [debounceTimeout],
  );

  const onSortTypePress = useCallback((sortBy: SortType) => {
    setSortOrderValue((current) => ({ ...current, sortBy }));
  }, []);

  const onToggleSortOrder = useCallback(() => {
    setSortOrderValue((current) => ({
      ...current,
      sortOrder:
        current.sortOrder === SortOrder.Ascending
          ? SortOrder.Descending
          : SortOrder.Ascending,
    }));
  }, []);

  useEffect(() => {
    if (
      !list ||
      (lastRenderRef.current.listLength === list.length &&
        lastRenderRef.current.filterValue === filterValue &&
        lastRenderRef.current.sortOrderValue.sortBy === sortOrderValue.sortBy &&
        lastRenderRef.current.sortOrderValue.sortOrder ===
          sortOrderValue.sortOrder &&
        lastRenderRef.current.listHash === getHash(list))
    ) {
      return;
    }

    lastRenderRef.current = {
      listLength: list.length,
      listHash: getHash(list),
      filterValue,
      sortOrderValue,
    };
    clearTimeout(debounceRef.current as ReturnType<typeof setTimeout>);
    const newArray = [...list]
      .filter((item) => {
        if (!item.title) return true;
        return item.title?.match(new RegExp(filterValue, 'ig'));
      })
      .sort(
        getSorter({
          sortType: sortOrderValue.sortBy,
          sortOrder: sortOrderValue.sortOrder,
        }),
      );
    onFilterChange(newArray, filterValue, sortOrderValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, filterValue, sortOrderValue.sortOrder, sortOrderValue.sortBy]);

  const elements = (
    <HStack
      space="sm"
      alignItems="center"
      justifyContent="center"
      flexDirection={swapButtonOrder ? 'row-reverse' : 'row'}
    >
      {children}
      <Menu>
        <MenuTrigger>
          <FontAwesome name="sort" size={20} />
        </MenuTrigger>
        <MenuOptions>
          {sortTypes.map((sortType) => (
            <MenuOption
              key={sortType}
              onSelect={() => onSortTypePress(sortType)}
              text={sortType}
            />
          ))}
        </MenuOptions>
      </Menu>
      <FontAwesome
        name={
          sortOrderValue.sortOrder === SortOrder.Ascending
            ? 'sort-asc'
            : 'sort-desc'
        }
        size={20}
        onPress={onToggleSortOrder}
      />
    </HStack>
  );

  return (
    <HStack
      space="sm"
      alignItems="center"
      flexDirection={swapElementOrder ? 'row-reverse' : 'row'}
    >
      <Input flex={1} variant="outline">
        <InputField
          placeholder="Filter"
          value={valueToDisplay}
          onChangeText={onChangeText}
        />
      </Input>
      {elements}
    </HStack>
  );
}
