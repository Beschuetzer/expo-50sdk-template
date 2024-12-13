import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from 'expo-router';
import { Text, useTheme, Stack } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import { ListFilter, ListFilterFilters } from './ListFilter';
import { ListItemSeparator } from './ListItemSeparator';
import { ListSorter } from './ListSorter';
import { SwipeableRow } from './SwipeableRow';
import { SortType } from './sorters';
import { AlphabeticalScroll } from '../AlphabeticalScroll';
import { AddButton } from '../header/AddButton';
import { ListHeaderRight } from '../header/ListHeaderRight';
import { useMenu } from '../hooks/useMenu';
import { useUpdatedListTitle } from '../hooks/useUpdateListTitle';
import { ConfirmModal, ConfirmModalProps } from '../modals/ConfirmModal';
import { StoreTile } from '../tiles/StoreTIle';

import {
  ESTIMATED_SIZE_FOR_STORES_LIST,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import {
  currentStoreSelector,
  listToDisplaySelector,
  setFilters,
  setSortOrder,
  setCurrentStoreId,
  storesListSelector,
  resetListToDisplay,
  currentStoreIdSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { deleteStores } from '@/state/thunks';
import { Key } from '@/types/Item';
import { Store } from '@/types/Store';
import { ListRow } from '@/types/general';
import { ListName } from '@/types/listSlice';
import { getKeyToUse, resetConfirmModalProps } from '@/utils/helpers';

type StoresListProps = object;

const storesListSortTypes = [SortType.Name, SortType.Distance] as SortType[];

const listName: ListName = ListName.StoresList;
export function StoresList(props: StoresListProps) {
  const navigation = useNavigation();
  const storesList = useAppSelector(storesListSelector);
  const storesListToDisplay = useAppSelector(
    listToDisplaySelector(listName),
  ) as Store[];
  const currentStore = useAppSelector(currentStoreSelector);
  const currentStoreId = useAppSelector(currentStoreIdSelector);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const listRef = useRef<FlashList<Store> | null>(null);
  const [listKey, setListKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {} as ConfirmModalProps,
  );
  const lastSortTypeRef = useRef(storesListSortTypes[0]);
  useUpdatedListTitle({ list: storesList, title: 'Stores List' });

  const [, closeMenu] = useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          onSortPress={onSortPress}
          onFilterPress={onFilterPress}
          onResetPress={onResetPress}
        />
      ),
      headerLeft: () => <AddButton onPress={onAddStorePress} />,
    }),
  });

  function onAddStorePress() {
    closeMenu();
    // @ts-ignore
    navigation.navigate(Routes.StoreModal);
  }

  const onSortPress = useCallback(() => {
    setIsSortModalOpen(true);
  }, []);

  const onFilterPress = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  const onResetPress = useCallback(() => {
    dispatch(resetListToDisplay({ listName }));
  }, []);

  const onSortTypeChange = useCallback((sortType: SortType) => {
    lastSortTypeRef.current = sortType;
    dispatch(setSortOrder({ listName, sortBy: sortType }));
  }, []);

  const onFilterValueChange = useCallback(
    (filters: ListFilterFilters<Store>) => {
      dispatch(setFilters({ listName, filters }));
    },
    [listName],
  );

  const onSwipeRight = useCallback(
    (key: Key) => {
      closeMenu();
      dispatch(setCurrentStoreId(getKeyToUse(key)));
    },
    [closeMenu],
  );

  const onSwipeLeft = useCallback(
    (store: Store) => {
      closeMenu();
      setConfirmModalProps({
        isVisible: true,
        title: 'Deleting Store',
        message: `Are you sure you want to delete '${store.name}'?`,
        note: 'This will remove all store-specific data related to this store.',
        onCancel: () => resetConfirmModalProps(setConfirmModalProps),
        onConfirm: () => {
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
    [listRef, closeMenu],
  );

  useEffect(() => {
    setListKey((current) => current + 1);
  }, [currentStoreId]);

  function renderItem({ item, index }: ListRow<Store>) {
    return (
      <SwipeableRow
        swipeableProps={{
          onBegan: closeMenu,
        }}
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
      <FlashList
        ref={listRef}
        key={listKey}
        refreshing={refreshing}
        onTouchStart={closeMenu}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        data={storesListToDisplay}
        renderItem={renderItem}
        keyExtractor={(item: Store, index: number) => getKeyToUse(item)}
        estimatedItemSize={ESTIMATED_SIZE_FOR_STORES_LIST}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
      <ListSorter
        sortOrderValue={storesList.sortOrderValue}
        listName={listName}
        isVisible={isSortModalOpen}
        setIsVisible={setIsSortModalOpen}
        onValueChange={onSortTypeChange}
        sortTypes={storesListSortTypes}
        viewSize="small"
      />
      <ListFilter
        list={storesList}
        listName={listName}
        filterNames={['name']}
        isVisible={isFilterModalOpen}
        setIsVisible={setIsFilterModalOpen}
        onValueChange={onFilterValueChange}
      />
      <AlphabeticalScroll
        items={storesList.data}
        onCharPress={(index) => {
          if (listRef?.current) {
            listRef.current.scrollToIndex({ animated: false, index });
          }
        }}
        sortOrderValue={storesList.sortOrderValue}
      />
      <ConfirmModal {...confirmModalProps} />
    </>
  );
}
