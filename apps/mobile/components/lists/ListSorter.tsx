import {
  Button,
  ButtonText,
  Heading,
  HStack,
  VStack,
} from '@gluestack-ui/themed';
import { Picker } from '@react-native-picker/picker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Dialog from 'react-native-dialog';

import { SORT_TYPE_DESCRIPTIONS, SortOrder, SortType } from './sorters';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { HeadingTagProp } from '@/types/general';

export type ListSortViewSize = 'large' | 'small';
type ListSorterProps = {
  isVisible: boolean;
  onMount?: () => void;
  onUnmount?: () => void;
  onSortOrderChange?: (sortOrder: SortOrder) => void;
  onValueChange: (sortType: SortType) => void;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  sortOrderValue: { sortBy: SortType; sortOrder: SortOrder };
  sortTypes: SortType[];
  title?: string;
  viewSize?: ListSortViewSize;
} & HeadingTagProp;

export function ListSorter(props: ListSorterProps) {
  const {
    headingTag: Tag = Heading,
    isVisible,
    onMount,
    onSortOrderChange,
    onUnmount,
    onValueChange,
    setIsVisible,
    sortOrderValue,
    sortTypes,
    title = 'List',
    viewSize = 'large',
  } = props;
  const ref = useRef<Picker<SortType>>(null);
  const defaultSortType = useMemo(
    () => sortTypes?.[0] || SortType.None,
    [sortTypes],
  );
  const [selectedSortType, setSelectedSortType] = useState(defaultSortType);

  const onCloseModal = useCallback(() => {
    setIsVisible && setIsVisible(false);
  }, [setIsVisible]);

  const onSortTypePress = useCallback(
    (sortType: SortType) => {
      setSelectedSortType(sortType);
      onValueChange && onValueChange(sortType);
    },
    [onValueChange],
  );

  useEffect(() => {
    onMount && onMount();
    return () => {
      onUnmount && onUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog.Container visible={isVisible} onBackdropPress={onCloseModal}>
      <Dialog.Title style={{ textAlign: 'center' }}>
        {title} Sorting
      </Dialog.Title>
      <VStack mt={FORM_INTER_ITEM_SPACING}>
        {viewSize === 'large' ? (
          <>
            <HStack pl="$1">
              <Tag>Sort By: </Tag>
            </HStack>
            <Picker
              ref={ref}
              selectedValue={selectedSortType}
              onValueChange={onSortTypePress}
            >
              {sortTypes.map((sortType) => (
                <Picker.Item
                  key={sortType}
                  label={SORT_TYPE_DESCRIPTIONS[sortType] || sortType}
                  value={sortType}
                />
              ))}
            </Picker>
          </>
        ) : (
          <>
            <HStack justifyContent="space-between" alignItems="center">
              <Button
                isDisabled={sortOrderValue.sortOrder === SortOrder.Ascending}
                variant="outline"
                onPress={() => onSortOrderChange?.(SortOrder.Ascending)}
              >
                <ButtonText>Ascending</ButtonText>
              </Button>
              <Button
                isDisabled={sortOrderValue.sortOrder === SortOrder.Descending}
                variant="outline"
                onPress={() => onSortOrderChange?.(SortOrder.Descending)}
              >
                <ButtonText>Descending</ButtonText>
              </Button>
            </HStack>
            <VStack>
              {sortTypes.map((sortType) => (
                <Button
                  isDisabled={sortType === sortOrderValue.sortBy}
                  variant="link"
                  key={sortType}
                  onPress={() => onSortTypePress(sortType)}
                >
                  <ButtonText>{SORT_TYPE_DESCRIPTIONS[sortType]}</ButtonText>
                </Button>
              ))}
            </VStack>
          </>
        )}
      </VStack>
      <Dialog.Button label="Close" onPress={onCloseModal} />
    </Dialog.Container>
  );
}
