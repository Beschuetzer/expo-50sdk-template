import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import {
  Box,
  Button,
  HStack,
  Pressable,
  Text,
  useTheme,
  VStack,
} from 'native-base';
import { useLayoutEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { ImageRenderer } from '@/components/ImageRenderer';
import CheckboxInput from '@/components/forms/CheckboxInput';
import { LocationPickerField } from '@/components/forms/LocationPickerField';
import { itemsPurchasedAtStoreSelector } from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { assignLocationsToItems } from '@/state/thunks';
import { PrevioulsyPurchasedItem, StoreSpecificValueKey } from '@/types/Item';
import { ensureMaxLength, getKeyToUse } from '@/utils/helpers';

const UNASSIGNED_VALUE = '';
const ALL_LOCATIONS_FILTER_VALUE = '__ALL_LOCATIONS__';

export default function RouteUnassignedItemsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { storeName, routeId, locations } = (route.params || {}) as {
    storeId?: string;
    storeName?: string;
    routeId: string;
    locations: string[];
  };

  const previouslyPurchasedAtStore = useAppSelector(
    itemsPurchasedAtStoreSelector,
  );

  // Only items that don't already have a location assigned for this route
  // show up by default; toggling `showOnlyUnassigned` off reveals every
  // previously purchased item (still limited to previously purchased items)
  // so an already-assigned item's location can be changed here too.
  const unassignedItems = useMemo(
    () =>
      previouslyPurchasedAtStore.filter(
        (item) => !item[StoreSpecificValueKey.Location]?.[routeId],
      ),
    [previouslyPurchasedAtStore, routeId],
  );

  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);
  const [locationFilter, setLocationFilter] = useState(
    ALL_LOCATIONS_FILTER_VALUE,
  );
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedItemKeys, setSelectedItemKeys] = useState<string[]>([]);
  const [bulkAssignLocation, setBulkAssignLocation] =
    useState<string>(UNASSIGNED_VALUE);

  // Tracks each item's currently persisted location (for this route), so
  // the Select can default to it when showing already-assigned items, and
  // so explicitly picking "Not assigned" on one of those is recognized as a
  // real change (queued for saving) rather than a no-op.
  const originalLocationByKey = useMemo(() => {
    const map: Record<string, string> = {};
    previouslyPurchasedAtStore.forEach((item) => {
      map[getKeyToUse(item)] =
        item[StoreSpecificValueKey.Location]?.[routeId] || UNASSIGNED_VALUE;
    });
    return map;
  }, [previouslyPurchasedAtStore, routeId]);

  const [draftAssignments, setDraftAssignments] = useState<
    Record<string, string>
  >({});

  // Combines the "show only unassigned" toggle with the location filter, so
  // the list can be narrowed both to items missing a location and to items
  // currently assigned to one specific location.
  const filteredItems = useMemo(() => {
    const base = showOnlyUnassigned
      ? unassignedItems
      : previouslyPurchasedAtStore;
    if (locationFilter === ALL_LOCATIONS_FILTER_VALUE) return base;
    return base.filter((item) => {
      const key = getKeyToUse(item);
      const location =
        draftAssignments[key] ?? originalLocationByKey[key] ?? UNASSIGNED_VALUE;
      return location === locationFilter;
    });
  }, [
    showOnlyUnassigned,
    unassignedItems,
    previouslyPurchasedAtStore,
    locationFilter,
    draftAssignments,
    originalLocationByKey,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Manage ${storeName ? `'${ensureMaxLength(storeName, 9)}' ` : ' '}Locations`,
    });
  }, [navigation, storeName]);

  const onSelectLocation = (key: string, location: string) => {
    setDraftAssignments((prev) => {
      const originalLocation = originalLocationByKey[key] ?? UNASSIGNED_VALUE;
      if (location === originalLocation) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: location };
    });
  };

  // Filtering by a specific location while "show only unassigned" is on
  // would always show an empty list (unassigned items have no location), so
  // picking any filter other than "All locations" turns that toggle off.
  const onSelectLocationFilter = (value: string) => {
    setLocationFilter(value);
    if (value !== ALL_LOCATIONS_FILTER_VALUE) {
      setShowOnlyUnassigned(false);
    }
  };

  const onToggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => !prev);
    setSelectedItemKeys([]);
  };

  const onToggleItemSelection = (key: string) => {
    setSelectedItemKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const onSelectAllItems = () => {
    setSelectedItemKeys(filteredItems.map((item) => getKeyToUse(item)));
  };

  const onUnselectAllItems = () => {
    setSelectedItemKeys([]);
  };

  const onApplyBulkLocation = () => {
    selectedItemKeys.forEach((key) =>
      onSelectLocation(key, bulkAssignLocation),
    );
    setSelectedItemKeys([]);
    setIsMultiSelectMode(false);
  };

  const assignedCount = Object.keys(draftAssignments).length;

  const onSave = () => {
    if (assignedCount > 0) {
      dispatch(
        assignLocationsToItems({
          routeId,
          assignments: draftAssignments,
        }),
      );
    }
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: PrevioulsyPurchasedItem }) => {
    const key = getKeyToUse(item);
    const selectedLocation =
      draftAssignments[key] ?? originalLocationByKey[key] ?? UNASSIGNED_VALUE;
    const isSelected = selectedItemKeys.includes(key);

    return (
      <Pressable
        onPress={() =>
          isMultiSelectMode ? onToggleItemSelection(key) : undefined
        }
        _pressed={isMultiSelectMode ? { opacity: 0.5 } : undefined}
      >
        <HStack
          px={4}
          py={3}
          alignItems="flex-start"
          justifyContent="space-between"
          borderBottomWidth={0.5}
          borderBottomColor={theme.colors.muted[200]}
          space={isMultiSelectMode ? 2 : 1}
        >
          {isMultiSelectMode && (
            <FontAwesome
              name={isSelected ? 'check-square' : 'square-o'}
              size={18}
              color={
                isSelected ? theme.colors.primary[600] : theme.colors.muted[400]
              }
              style={{ marginTop: 4 }}
            />
          )}
          <ImageRenderer item={item} useMarginRight={!isMultiSelectMode} />
          <VStack space={2} w="100%" flex={1}>
            <Text
              flex={isMultiSelectMode ? 0 : 1}
              fontSize="xs"
              fontWeight="500"
              color={theme.colors.dark[400]}
            >
              {item.name}
            </Text>
            <Text
              flex={isMultiSelectMode ? 0 : 1}
              fontSize="xs"
              fontWeight="500"
              color={theme.colors.dark[400]}
            >
              {item.upc ? `UPC: ${item.upc}` : 'No UPC'}
            </Text>
            {!isMultiSelectMode && (
              <LocationPickerField
                height={9}
                locations={locations}
                value={selectedLocation}
                onChange={(value) => onSelectLocation(key, value)}
                placeholder="Assign location"
                title="Assign Location"
                extraOptions={[
                  { label: 'Not assigned', value: UNASSIGNED_VALUE },
                ]}
              />
            )}
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <VStack flex={1} bg="white">
        <Box
          px={4}
          py={3}
          bg={theme.colors.muted[50]}
          borderBottomWidth={1}
          borderBottomColor={theme.colors.muted[200]}
        >
          <Text
            fontSize="xs"
            fontWeight="700"
            color={theme.colors.muted[500]}
            mb={2}
          >
            {unassignedItems.length} item
            {unassignedItems.length !== 1 ? 's' : ''} without a location for
            this route
          </Text>
          <CheckboxInput
            // Remounts when showOnlyUnassigned is changed programmatically
            // (e.g. by the location filter below), since CheckboxInput only
            // reads `initialValue` once and otherwise manages its own state.
            key={`show-only-unassigned-${showOnlyUnassigned}`}
            initialValue={showOnlyUnassigned}
            label="Show only unassigned items"
            onValueChange={setShowOnlyUnassigned}
          />
          <Text
            fontSize="xs"
            fontWeight="700"
            color={theme.colors.muted[500]}
            mt={3}
            mb={1}
          >
            Filter by location
          </Text>
          <LocationPickerField
            height={9}
            locations={locations}
            value={locationFilter}
            onChange={onSelectLocationFilter}
            placeholder="Filter by location"
            title="Filter by Location"
            extraOptions={[
              { label: 'All locations', value: ALL_LOCATIONS_FILTER_VALUE },
              { label: 'Not assigned', value: UNASSIGNED_VALUE },
            ]}
          />
        </Box>
        <HStack
          px={4}
          py={2}
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor={theme.colors.muted[200]}
        >
          <Text fontSize="xs" fontWeight="700" color={theme.colors.muted[500]}>
            Items ({filteredItems.length})
          </Text>
          <Pressable onPress={onToggleMultiSelectMode} hitSlop={8}>
            <Text
              fontSize="xs"
              fontWeight="700"
              color={theme.colors.primary[600]}
              numberOfLines={1}
            >
              {isMultiSelectMode ? 'Cancel' : 'Select'}
            </Text>
          </Pressable>
        </HStack>
        {isMultiSelectMode && (
          <HStack
            px={4}
            py={2}
            space={2}
            borderBottomWidth={1}
            borderBottomColor={theme.colors.muted[200]}
            alignItems="center"
          >
            <Pressable
              flex={1}
              onPress={
                selectedItemKeys.length === filteredItems.length
                  ? onUnselectAllItems
                  : onSelectAllItems
              }
              bg={theme.colors.muted[200]}
              borderRadius={6}
              py={1.5}
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Text
                fontSize="xs"
                fontWeight="700"
                color={theme.colors.muted[600]}
              >
                {selectedItemKeys.length === filteredItems.length
                  ? 'Unselect All'
                  : 'Select All'}
              </Text>
            </Pressable>
          </HStack>
        )}
        {isMultiSelectMode ? (
          <HStack
            px={4}
            py={2}
            space={2}
            borderBottomWidth={1}
            borderBottomColor={theme.colors.muted[200]}
            alignItems="center"
          >
            <LocationPickerField
              flex={1}
              height={9}
              locations={locations}
              value={bulkAssignLocation}
              onChange={setBulkAssignLocation}
              placeholder="Assign location"
              title="Assign Location"
              extraOptions={[
                { label: 'Not assigned', value: UNASSIGNED_VALUE },
              ]}
            />
            <Pressable
              onPress={onApplyBulkLocation}
              bg={theme.colors.primary[600]}
              borderRadius={8}
              px={4}
              h={9}
              alignItems="center"
              justifyContent="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Text color="white" fontWeight="700" fontSize="xs">
                Apply ({selectedItemKeys.length})
              </Text>
            </Pressable>
          </HStack>
        ) : null}
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => getKeyToUse(item)}
          renderItem={renderItem}
          extraData={{ draftAssignments, isMultiSelectMode, selectedItemKeys }}
          estimatedItemSize={56}
          ListEmptyComponent={
            <Box px={4} py={6} alignItems="center">
              <Text color={theme.colors.muted[400]} fontSize="sm">
                {showOnlyUnassigned
                  ? 'Every previously purchased item already has a location for this route.'
                  : 'No previously purchased items found.'}
              </Text>
            </Box>
          }
        />

        {/* Save button */}
        <Box
          px={4}
          py={3}
          borderTopWidth={1}
          borderTopColor={theme.colors.muted[200]}
        >
          <Button
            onPress={onSave}
            isDisabled={assignedCount === 0}
            borderRadius={8}
            shadow={assignedCount > 0 ? 2 : 0}
          >
            <Text
              numberOfLines={1}
              fontSize="md"
              fontWeight="700"
              color="white"
            >
              Save ({assignedCount})
            </Text>
          </Button>
        </Box>
      </VStack>
    </KeyboardAvoidingView>
  );
}
