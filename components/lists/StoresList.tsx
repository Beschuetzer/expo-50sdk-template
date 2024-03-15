import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useNavigation } from 'expo-router';
import { Text, useTheme, Stack, Row } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { Menu } from 'react-native-popup-menu';
import { useDispatch, useSelector } from 'react-redux';

import { ListFilter, ListFilterFilters } from './ListFilter';
import { ListItemSeparator } from './ListItemSeparator';
import { ListSorter } from './ListSorter';
import { SwipeableRow } from './SwipeableRow';
import { SortType } from './sorters';
import { AddButton } from '../header/AddButton';
import { ListHeaderRight } from '../header/ListHeaderRight';
import { useUpdatedListTitle } from '../hooks/useUpdateListTitle';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import {
  ListName,
  currentStoreSelector,
  listToDisplaySelector,
  removeStoresListItem,
  setFilters,
  setSortOrder,
  setCurrentStoreName,
  storesListSelector,
  resetListToDisplay,
} from '@/state/slices/listsSlice';
import { Key } from '@/types/Item';
import { Store } from '@/types/Store';
import { ListRow } from '@/types/general';
import { getKeyToUse } from '@/utils/helpers';

type StoresListProps = object;

const storesListSortTypes = [SortType.Name, SortType.Distance] as SortType[];

const listName: ListName = ListName.StoresList;
export function StoresList(props: StoresListProps) {
  const navigation = useNavigation();
  const storesList = useSelector(storesListSelector);
  const storesListToDisplay = useSelector(
    listToDisplaySelector(listName),
  ) as Store[];
  const currentStore = useSelector(currentStoreSelector);
  const theme = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlashList<Store> | null>(null);
  const [listKey, setListKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const lastSortTypeRef = useRef(storesListSortTypes[0]);
  const menuRef = useRef<Menu>(null);
  useUpdatedListTitle({ list: storesList, title: 'Stores List' });

  const closeMenu = useCallback(() => {
    menuRef.current?.close();
  }, [menuRef]);

  function onAddStorePress() {
    closeMenu();
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
      dispatch(setCurrentStoreName(key?.name));
    },
    [closeMenu],
  );

  const onSwipeLeft = useCallback(
    (keyToUse: Key) => {
      closeMenu();
      dispatch(removeStoresListItem(keyToUse));
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    },
    [listRef, closeMenu],
  );

  useEffect(() => {
    setListKey((current) => current + 1);
  }, [currentStore]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          onSortPress={onSortPress}
          onFilterPress={onFilterPress}
          onResetPress={onResetPress}
          listName={listName}
        />
      ),
      headerLeft: () => <AddButton onPress={onAddStorePress} />,
    });
  }, [navigation]);

  useFocusEffect(() => {
    closeMenu();
  });

  function renderItem({ item, index }: ListRow<Store>) {
    const keyToUse = {
      name: item.name,
      upc: EMPTY_STRING,
    } as Key;

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
          onPress: onSwipeLeft.bind(null, keyToUse),
        }}
        rightSwipe={{
          backgroundColor: theme.colors.primary[900],
          onPress: onSwipeRight.bind(null, keyToUse),
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
        <RectButton
          style={styles.rectButton}
          onPress={() => {
            navigation.navigate(Routes.StoreModal, {
              name: keyToUse.name,
            });
          }}
        >
          <Stack>
            <Row
              px={theme.space[FORM_INTER_ITEM_SPACING]}
              space={theme.space[2]}
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack flex={1} justifyContent="center">
                <Text fontSize={theme.fontSizes['lg']}>{item.name}</Text>
                {/* <Text>
                      ({item.gpsCoordinates?.lat}, {item.gpsCoordinates?.lon})
                    </Text> */}
                <Text>
                  Estimated Distance:{' '}
                  {item?.calculatedDistance == null ||
                  item.calculatedDistance < 0
                    ? 'N/A'
                    : `${item.calculatedDistance}mi.`}
                </Text>
              </Stack>
              <Stack>
                {currentStore?.name !== keyToUse.name ? (
                  <TouchableOpacity
                    onPress={() => dispatch(setCurrentStoreName(keyToUse.name))}
                  >
                    <Text color={theme.colors.info[900]}>Set as Current</Text>
                  </TouchableOpacity>
                ) : (
                  <Text>Current</Text>
                )}
              </Stack>
            </Row>
          </Stack>
        </RectButton>
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
        estimatedItemSize={120}
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
    </>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
});
