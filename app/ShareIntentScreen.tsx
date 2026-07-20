import { useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import Constants from 'expo-constants';
import { useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FilterListInput from '@/components/FilterListInput';
import { AddButton } from '@/components/header/AddButton';
import { CloseButton } from '@/components/header/CloseButton';
import { useSharedUrl } from '@/components/hooks/useSharedUrl';
import { ListItemSeparator } from '@/components/lists/ListItemSeparator';
import { SortType } from '@/components/lists/sorters';
import { COLORS } from '@/constants/colors';
import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_ITEMS_LIST,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import {
  itemsListSelector,
  storeSpecificValuesMapSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { saveItem } from '@/state/thunks';
import { Item } from '@/types/Item';
import { getKeyToUse } from '@/utils/helpers';

// Conditional require — module factory never runs in Expo Go
const { useShareIntentContext } =
  Constants.appOwnership === 'expo'
    ? {
        useShareIntentContext: () =>
          ({ shareIntent: null, resetShareIntent: () => {} }) as any,
      }
    : (require('expo-share-intent') as typeof import('expo-share-intent'));

export default function ShareIntentScreen() {
  const { shareIntent, resetShareIntent } = useShareIntentContext();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { mockUrl } = (route.params || {}) as { mockUrl?: string };
  const dispatch = useAppDispatch();
  const items = useAppSelector(itemsListSelector).data ?? [];
  const storeSpecificValuesMap = useAppSelector(storeSpecificValuesMapSelector);
  const [filteredItems, setFilteredItems] = useState<Item[]>(items);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const contextUrl = useSharedUrl(shareIntent);
  const sharedUrl = mockUrl || contextUrl;

  function tryReset() {
    try {
      resetShareIntent();
    } catch {
      // clearShareIntent native method may be absent in older dev builds
    }
  }

  function handleCreateNew() {
    tryReset();
    navigation.push(Routes.ItemModal, {
      showBlank: true,
      key: { upc: EMPTY_STRING, name: EMPTY_STRING },
      sharedUrl,
    });
  }

  function handleSave() {
    if (!selectedItem) return;
    tryReset();
    dispatch(
      saveItem({
        hasKeyChanged: false,
        item: { ...selectedItem, url: sharedUrl, needsSaving: true },
        storeSpecificValues:
          storeSpecificValuesMap[getKeyToUse(selectedItem)] ?? null,
        originalKey: selectedItem,
      }),
    );
    navigation.goBack();
  }

  // Set header buttons dynamically so they can access sharedUrl from closure
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <AddButton onPress={handleCreateNew} />,
      headerRight: () => <CloseButton />,
    });
  }, [sharedUrl]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Link URL to an item</Text>
      <Text style={styles.url} numberOfLines={2}>
        {sharedUrl}
      </Text>
      <FilterListInput
        list={items}
        onFilterChange={(filtered) => setFilteredItems(filtered)}
        sortTypes={[
          SortType.Name,
          SortType.Upc,
          SortType.AddedDate,
          SortType.LastUpdatedDate,
          SortType.Frequency,
        ]}
      />
      <FlashList
        data={filteredItems}
        extraData={selectedItem}
        keyExtractor={(item) => getKeyToUse(item)}
        renderItem={({ item }) => {
          const isSelected =
            selectedItem && getKeyToUse(item) === getKeyToUse(selectedItem);
          return (
            <TouchableOpacity
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => setSelectedItem(isSelected ? null : item)}
            >
              <Text
                style={[styles.rowText, isSelected && styles.rowTextSelected]}
              >
                {item.name ?? item.upc}
              </Text>
              {item.upc ? (
                <Text
                  style={[styles.rowUpc, isSelected && styles.rowTextSelected]}
                >
                  #{item.upc}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
        estimatedItemSize={ESTIMATED_SIZE_FOR_ITEMS_LIST}
        ItemSeparatorComponent={() => <ListItemSeparator />}
        ListEmptyComponent={<Text style={styles.empty}>No items found.</Text>}
        keyboardShouldPersistTaps="always"
      />
      <TouchableOpacity
        style={[styles.saveButton, !selectedItem && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!selectedItem}
      >
        <Text style={styles.saveText} numberOfLines={2}>
          {selectedItem
            ? `Link url to "${selectedItem.name ?? selectedItem.upc}"`
            : 'Select an item to save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  url: {
    fontSize: 13,
    color: COLORS.light.tint,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowSelected: {
    backgroundColor: COLORS.light.selected,
  },
  rowText: {
    fontSize: 16,
  },
  rowTextSelected: {
    color: COLORS.light.background,
  },
  rowUpc: {
    fontSize: 12,
    color: COLORS.light.muted,
    marginTop: 2,
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: COLORS.light.muted,
  },
  saveButton: {
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.light.tint,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.light.disabled,
  },
  saveText: {
    fontSize: 16,
    color: COLORS.light.background,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
