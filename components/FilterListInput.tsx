import { FontAwesome } from '@expo/vector-icons';
import { capitalize } from 'lodash';
import { Input, theme, Button, Row, Menu, Text } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getSorter, SortOrder, SortType } from './lists/sorters';

import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  SORT_ORDER_VALUE_BY_NAME_DEFAULT,
} from '@/constants/general';
import { currentStoreIdSelector } from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import { Key } from '@/types/Item';
import { SortOrderValue } from '@/types/listSlice';

type FilterInputProps<T extends Key> = {
  debounceTimeout?: number;
  onFilterChange: (
    list: T[],
    filterValue: string,
    sortOrderValue: SortOrderValue,
  ) => void;
  list: T[];
  sortTypes?: SortType[];
  startingSortOrderValue?: SortOrderValue;
  swapElementOrder?: boolean;
  swapButtonOrder?: boolean;
};

export default function FilterListInput<T extends Key>({
  debounceTimeout = 300,
  list,
  onFilterChange,
  sortTypes = Object.values(SortType).filter(
    (sortType) => sortType !== SortType.None,
  ),
  swapElementOrder = false,
  swapButtonOrder = false,
  startingSortOrderValue = SORT_ORDER_VALUE_BY_NAME_DEFAULT,
}: FilterInputProps<T>) {
  const currentStoreId = useAppSelector(currentStoreIdSelector);
  const [filterValue, setFilterValue] = useState(EMPTY_STRING);
  const [valueToDisplay, setValueToDisplay] = useState(EMPTY_STRING);
  const [sortMenuVisible, setSortMenuVisible] = useState<string>(EMPTY_STRING);
  const [sortOrderValue, setSortOrderValue] = useState<SortOrderValue>(
    startingSortOrderValue,
  );
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastRenderRef = useRef<{
    listLength: number;
    filterValue: string;
    sortOrderValue: SortOrderValue;
  }>({
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

  const onSortTypePress = useCallback(
    (sortBy: SortType, sortOrder: SortOrder) => {
      setSortOrderValue({ sortBy, sortOrder });
      setSortMenuVisible(EMPTY_STRING);
    },
    [],
  );

  const reset = useCallback(() => {
    setFilterValue(EMPTY_STRING);
    setValueToDisplay(EMPTY_STRING);
    setSortOrderValue(SORT_ORDER_VALUE_BY_NAME_DEFAULT);
  }, []);

  useEffect(() => {
    if (
      !list ||
      (lastRenderRef.current.listLength === list.length &&
        lastRenderRef.current.filterValue === filterValue &&
        lastRenderRef.current.sortOrderValue.sortBy === sortOrderValue.sortBy &&
        lastRenderRef.current.sortOrderValue.sortOrder ===
          sortOrderValue.sortOrder)
    )
      return;
    lastRenderRef.current = {
      listLength: list.length,
      filterValue,
      sortOrderValue,
    };
    clearTimeout(debounceRef.current as NodeJS.Timeout);
    const newArray = list
      .filter((item) => {
        if (!item.name) return true;
        return item.name?.match(new RegExp(filterValue, 'ig'));
      })
      .sort(
        getSorter(
          sortOrderValue.sortBy,
          currentStoreId,
          sortOrderValue.sortOrder,
        ),
      );
    onFilterChange(newArray, filterValue, sortOrderValue);
  }, [
    currentStoreId,
    list,
    filterValue,
    sortOrderValue.sortOrder,
    sortOrderValue.sortBy,
  ]);

  function renderRightElements() {
    return (
      <Row
        space={FORM_INTER_ITEM_SPACING}
        alignItems="center"
        justifyContent="center"
        flexDirection={swapButtonOrder ? 'row-reverse' : 'row'}
      >
        {Object.values(SortOrder).map((sortOrder) => (
          <Menu
            key={sortOrder}
            isOpen={sortMenuVisible === sortOrder}
            onClose={() => setSortMenuVisible(EMPTY_STRING)}
            placement="bottom right"
            trigger={(triggerProps) => {
              return (
                <Button
                  {...triggerProps}
                  variant="ghost"
                  onPress={() => {
                    setSortMenuVisible(sortOrder);
                  }}
                >
                  <FontAwesome
                    name={`sort-${sortOrder === SortOrder.Ascending ? 'asc' : 'desc'}`}
                    size={theme.fontSizes.lg}
                  />
                </Button>
              );
            }}
          >
            <Row p={theme.space[1]} justifyContent="center">
              <Text bold>Sort {capitalize(sortOrder)} By:</Text>
            </Row>
            {sortTypes.map((sortType) => (
              <Menu.Item
                key={sortType}
                onPress={() => onSortTypePress(sortType as SortType, sortOrder)}
                onLongPress={() => {
                  setSortMenuVisible(EMPTY_STRING);
                }}
                isDisabled={
                  sortOrderValue.sortBy === sortType &&
                  sortOrderValue.sortOrder === sortOrder
                }
              >
                {sortType}
              </Menu.Item>
            ))}
          </Menu>
        ))}

        <Button
          variant="ghost"
          isDisabled={!filterValue}
          onPress={() => {
            reset();
          }}
        >
          <FontAwesome name="times-circle" size={theme.fontSizes.lg} />
        </Button>
      </Row>
    );
  }

  const inputJSX = (
    <Input
      flex={1}
      value={valueToDisplay}
      onChangeText={onChangeText}
      placeholder="Filter"
      variant="unstyled"
    />
  );

  return (
    <Row
      flex={0}
      alignItems="center"
      justifyContent="flex-start"
      backgroundColor={theme.colors.gray[100]}
      borderBottomColor={theme.colors.gray[400]}
      borderBottomWidth={1}
    >
      {swapElementOrder ? (
        <>
          {renderRightElements()}
          {inputJSX}
        </>
      ) : (
        <>
          {inputJSX}
          {renderRightElements()}
        </>
      )}
    </Row>
  );
}
