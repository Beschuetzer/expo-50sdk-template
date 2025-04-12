import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from 'expo-router';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';
import { SortType } from './sorters';
import { AlphabeticalScroll } from '../AlphabeticalScroll';
import FilterListInput from '../FilterListInput';
import { AddButton } from '../header/AddButton';
import { useMenu } from '../hooks/useMenu';
import { useUpdatedListTitle } from '../hooks/useUpdateListTitle';
import { ConfirmModal, ConfirmModalProps } from '../modals/ConfirmModal';
import { StoreTile } from '../tiles/StoreTIle';

import {
  ESTIMATED_SIZE_FOR_STORES_LIST,
  FORM_INTER_ITEM_SPACING,
  LIST_HAPTICS,
  SORT_ORDER_VALUE_BY_NAME_DEFAULT,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import {
  currentStoreSelector,
  setCurrentStoreId,
  storesListSelector,
  currentStoreIdSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { deleteStores } from '@/state/thunks';
import { Key } from '@/types/Item';
import { Store } from '@/types/Store';
import { ListRow } from '@/types/general';
import { getKeyToUse, resetConfirmModalProps } from '@/utils/helpers';

type StoresListProps = object;

export function StoresList(props: StoresListProps) {
  const navigation = useNavigation();
  const storesList = useAppSelector(storesListSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const currentStoreId = useAppSelector(currentStoreIdSelector);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const listRef = useRef<FlashList<Store> | null>(null);
  const [listKey, setListKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrderValue, setSortOrderValue] = useState(
    SORT_ORDER_VALUE_BY_NAME_DEFAULT,
  );
  const [storesToDisplay, setStoresToDisplay] = useState(storesList.data);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {} as ConfirmModalProps,
  );
  useUpdatedListTitle({ list: storesList, title: 'Stores List' });

  const [, closeMenu] = useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerLeft: () => <AddButton onPress={onAddStorePress} />,
    }),
  });

  function onAddStorePress() {
    closeMenu();
    //@ts-ignore
    navigation.navigate(Routes.StoreModal);
  }

  const onSwipeRight = useCallback((key: Key) => {
    LIST_HAPTICS.handleSwipeItem()();
    dispatch(setCurrentStoreId(getKeyToUse(key)));
  }, []);

  const onSwipeLeft = useCallback(
    (store: Store) => {
      setConfirmModalProps({
        isVisible: true,
        title: 'Deleting Store',
        message: `Are you sure you want to delete '${store.name}'?`,
        note: 'This will remove all store-specific data related to this store.',
        onCancel: () => resetConfirmModalProps(setConfirmModalProps),
        onConfirm: () => {
          LIST_HAPTICS.handleSwipeItem(true)();
          dispatch(
            deleteStores({
              stores: [store],
            }),
          );
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          resetConfirmModalProps(setConfirmModalProps);
        },
      });
    },
    [listRef],
  );

  useEffect(() => {
    setListKey((current) => current + 1);
  }, [currentStoreId]);

  function renderItem({ item, index }: ListRow<Store>) {
    return (
      <SwipeableRow
        leftSwipe={{
          title: (
            <Stack paddingRight={theme.space[2]} alignItems="center">
              <FontAwesome
                name="trash"
                color={theme.colors.white}
                size={theme.sizes[8]}
              />
            </Stack>
          ),
          backgroundColor: theme.colors.red[900],
          onPress: onSwipeLeft.bind(null, item),
        }}
        rightSwipe={{
          backgroundColor: theme.colors.primary[900],
          onPress: onSwipeRight.bind(null, item),
          title: (
            <Stack
              paddingLeft={theme.space[FORM_INTER_ITEM_SPACING]}
              alignItems="center"
            >
              <Text color={theme.colors.white}>Set as Current</Text>
            </Stack>
          ),
        }}
      >
        <StoreTile
          currentStore={currentStore}
          currentStoreId={currentStoreId}
          store={item}
        />
      </SwipeableRow>
    );
  }
  return (
    <>
      <FilterListInput
        list={storesList.data}
        onFilterChange={(filteredValues, _, sortOrderValue) => {
          setStoresToDisplay(filteredValues);
          setSortOrderValue(sortOrderValue);
        }}
        sortTypes={Object.values(SortType).filter(
          (sortType) =>
            sortType === SortType.Name || sortType === SortType.Distance,
        )}
        swapElementOrder
      />
      <FlashList
        ref={listRef}
        key={listKey}
        keyboardShouldPersistTaps="always"
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        data={storesToDisplay}
        renderItem={renderItem}
        keyExtractor={(item: Store, index: number) => getKeyToUse(item)}
        estimatedItemSize={ESTIMATED_SIZE_FOR_STORES_LIST}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
      {sortOrderValue.sortBy === SortType.Name ? (
        <AlphabeticalScroll
          items={storesToDisplay}
          onCharPress={(index) => {
            if (listRef?.current) {
              listRef.current.scrollToIndex({ animated: false, index });
            }
          }}
          sortOrderValue={sortOrderValue}
        />
      ) : null}
      <ConfirmModal {...confirmModalProps} />
    </>
  );
}
