import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  Box,
  Button,
  HStack,
  Input,
  Pressable,
  Text,
  useTheme,
  VStack,
} from 'native-base';
import { useState, useLayoutEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';

import { useAlertOnUnSavedWork } from '@/components/hooks/useAlertOnUnSavedWork';
import {
  ConfirmModal,
  ConfirmModalProps,
} from '@/components/modals/ConfirmModal';
import { ModalWithBlur } from '@/components/modals/ModalWithBlur';
import { EMPTY_STRING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { accountSelector, setError } from '@/state/slices/generalSlice';
import {
  routesForStoreSelector,
  locationsForStoreSelector,
  currentStoreSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import {
  saveStoreRoutes,
  updateItemsForRouteLocationChange,
} from '@/state/thunks';
import { getKeyToUse, getId, resetConfirmModalProps } from '@/utils/helpers';

const IMPORTABLE_FILE_EXTENSIONS = ['.txt', '.csv'];
const DIFF_ROW_HEIGHT = 10;
// Rough estimate of the space taken up by everything else in the modal
// (title, intro text, name-change box, table header, padding, and the
// confirm/cancel button row), so the diff list can be sized to fill
// whatever is left of the modal's max height instead of a fixed row count.
const RESERVED_MODAL_CHROME_HEIGHT = 260;

type LocationIndexDiff = {
  index: number;
  originalValue: string;
  currentValue: string;
};

/**
 *Compares the original and current locations index by index and returns a
 *row for each index that differs, so the unsaved-changes confirmation can
 *show exactly what changed instead of dumping both full arrays.
 **/
function getLocationIndexDiffs(
  original: string[],
  current: string[],
): LocationIndexDiff[] {
  const diffs: LocationIndexDiff[] = [];
  const maxLength = Math.max(original.length, current.length);

  for (let i = 0; i < maxLength; i++) {
    const originalValue = original[i];
    const currentValue = current[i];
    if (originalValue === currentValue) continue;

    diffs.push({
      index: i,
      originalValue: originalValue ?? '(none)',
      currentValue: currentValue ?? '(none)',
    });
  }

  return diffs;
}

export default function RouteCreationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const account = useAppSelector(accountSelector);
  const currentStore = useAppSelector(currentStoreSelector);

  const {
    storeId: paramStoreId,
    storeName,
    routeId,
  } = (route.params || {}) as {
    storeId?: string;
    storeName?: string;
    routeId?: string;
  };

  const storeId = paramStoreId || getKeyToUse(currentStore);
  const allRoutes = useAppSelector(routesForStoreSelector(storeId));
  const availableLocations = useAppSelector(locationsForStoreSelector(storeId));
  const existingRoute = routeId
    ? allRoutes.find((r) => r.id === routeId) ?? null
    : null;
  // Locations are assigned to items keyed by routeId, so a stable id must
  // exist even before the route has been saved for the first time.
  const [stableRouteId] = useState(
    () => existingRoute?.id || routeId || getId(),
  );

  const [routeName, setRouteName] = useState(existingRoute?.name ?? '');
  const [locations, setLocations] = useState<string[]>(
    existingRoute?.locations ?? [],
  );
  const [newLocationName, setNewLocationName] = useState('');
  const [insertAtPosition, setInsertAtPosition] = useState('');
  const [isExistingLocationsModalVisible, setIsExistingLocationsModalVisible] =
    useState(false);
  const [checkedExistingLocations, setCheckedExistingLocations] = useState<
    string[]
  >([]);
  const [moveModalIndex, setMoveModalIndex] = useState<number | null>(null);
  const [moveIndexInput, setMoveIndexInput] = useState('');
  const [moveRelativeLocation, setMoveRelativeLocation] = useState<
    string | null
  >(null);
  const [movePosition, setMovePosition] = useState<'before' | 'after'>('after');
  const [renameModalIndex, setRenameModalIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedLocationIndices, setSelectedLocationIndices] = useState<
    number[]
  >([]);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {} as ConfirmModalProps,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Create Route${storeName ? ` for '${storeName}'` : ''}`,
    });
  }, [navigation, storeName]);

  const hasChanges = existingRoute
    ? routeName.trim() !== existingRoute.name ||
      locations.length !== existingRoute.locations.length ||
      locations.some((loc, i) => loc !== existingRoute.locations[i])
    : true;

  const canSave =
    routeName.trim().length > 0 && locations.length >= 1 && hasChanges;

  const originalName = existingRoute?.name ?? '';
  const originalLocations = existingRoute?.locations ?? [];
  const nameChanged = routeName.trim() !== originalName;
  // Tracks, for each *currently* displayed location name, the originally
  // persisted location name (if any) it corresponds to. Renames/deletes are
  // only queued against names that exist in `originalNameByCurrentNameRef`,
  // since brand new locations added this session were never persisted and
  // have nothing to sync in the storeSpecificValues map.
  const originalNameByCurrentNameRef = useRef<Record<string, string>>(
    Object.fromEntries(originalLocations.map((loc) => [loc, loc])),
  );
  // Accumulates the net rename/delete for each originally persisted
  // location name (collapsing multiple renames of the same slot into one
  // entry) so item location assignments are only persisted once, when the
  // user actually presses Save/Update Route -- not as each edit is made.
  const pendingLocationChangesRef = useRef<Record<string, string>>({});

  const queueLocationChange = (currentName: string, newName?: string) => {
    const mapping = originalNameByCurrentNameRef.current;
    const originalLocationName = mapping[currentName];
    if (!originalLocationName) return;

    pendingLocationChangesRef.current = {
      ...pendingLocationChangesRef.current,
      [originalLocationName]: newName || EMPTY_STRING,
    };

    const nextMapping = { ...mapping };
    delete nextMapping[currentName];
    if (newName) {
      nextMapping[newName] = originalLocationName;
    }
    originalNameByCurrentNameRef.current = nextMapping;
  };
  const locationIndexDiffs = useMemo(
    () => getLocationIndexDiffs(originalLocations, locations),
    [originalLocations, locations],
  );
  // Unlike `hasChanges` (used for enabling Save), this only cares whether
  // the user has actually typed/added anything, so a brand new, still-empty
  // route doesn't immediately count as "unsaved changes".
  const isDirty = existingRoute
    ? nameChanged || locationIndexDiffs.length > 0
    : routeName.trim().length > 0 || locations.length > 0;

  const { height: windowHeight } = useWindowDimensions();
  const maxDiffListHeight = Math.max(
    windowHeight * 0.95 - RESERVED_MODAL_CHROME_HEIGHT,
    DIFF_ROW_HEIGHT * 3,
  );
  const diffListHeight = Math.min(windowHeight * 0.95, maxDiffListHeight);

  const getLocationKey = (location: string) => location.trim().toLowerCase();

  const showDuplicateLocationsWarning = (duplicates: string[]) => {
    setConfirmModalProps({
      isVisible: true,
      title: 'Duplicate Locations',
      message: (
        <VStack space={2}>
          <Text>These locations were duplicates and were not added:</Text>
          <Text>{duplicates.join('\n')}</Text>
        </VStack>
      ),
      cancelButton: {
        isVisible: false,
      },
      confirmButton: {
        text: 'Ok',
      },
      onConfirm: () => resetConfirmModalProps(setConfirmModalProps),
    });
  };

  const { confirmModalProps: unsavedChangesModalProps, markAsSaved } =
    useAlertOnUnSavedWork({
      isDirty,
      containerStyles: {
        width: '90%',
        maxHeight: '95%',
        maxWidth: '800px',
      },
      message: (
        <VStack space={2}>
          <Text fontSize="sm" color={theme.colors.dark[400]}>
            You have unsaved changes that will be lost if you leave this screen.
          </Text>
          {nameChanged && (
            <Box bg={theme.colors.muted[50]} borderRadius={6} px={3} py={2}>
              <Text
                fontSize="2xs"
                fontWeight="700"
                color={theme.colors.muted[500]}
                mb={1}
              >
                Name
              </Text>
              <Text fontSize="xs" color={theme.colors.black[700]}>
                {`'${originalName || '(none)'}' → '${routeName.trim() || '(none)'}'`}
              </Text>
            </Box>
          )}
          {locationIndexDiffs.length > 0 && (
            <VStack
              borderWidth={1}
              borderColor={theme.colors.muted[200]}
              borderRadius={4}
              overflow="hidden"
            >
              <HStack bg={theme.colors.muted[100]}>
                <Box flex={1} px={2} py={0.5}>
                  <Text
                    fontSize="2xs"
                    fontWeight="700"
                    color={theme.colors.muted[600]}
                  >
                    Index
                  </Text>
                </Box>
                <Box
                  flex={3}
                  px={2}
                  py={0.5}
                  borderLeftWidth={1}
                  borderLeftColor={theme.colors.muted[200]}
                >
                  <Text
                    fontSize="2xs"
                    fontWeight="700"
                    color={theme.colors.muted[600]}
                  >
                    Original
                  </Text>
                </Box>
                <Box
                  flex={3}
                  px={2}
                  py={0.5}
                  borderLeftWidth={1}
                  borderLeftColor={theme.colors.muted[200]}
                >
                  <Text
                    fontSize="2xs"
                    fontWeight="700"
                    color={theme.colors.muted[600]}
                  >
                    Current
                  </Text>
                </Box>
              </HStack>
              <Box height={diffListHeight}>
                <FlashList<LocationIndexDiff>
                  data={locationIndexDiffs}
                  keyExtractor={(row) => String(row.index)}
                  estimatedItemSize={DIFF_ROW_HEIGHT}
                  renderItem={({ item: row }) => (
                    <HStack
                      borderTopWidth={1}
                      borderTopColor={theme.colors.muted[200]}
                      height={DIFF_ROW_HEIGHT}
                      alignItems="center"
                    >
                      <Box flex={1} px={2}>
                        <Text fontSize="2xs" color={theme.colors.black[600]}>
                          {row.index}
                        </Text>
                      </Box>
                      <Box
                        flex={3}
                        px={2}
                        borderLeftWidth={1}
                        borderLeftColor={theme.colors.muted[200]}
                      >
                        <Text fontSize="2xs" color={theme.colors.black[700]}>
                          {row.originalValue}
                        </Text>
                      </Box>
                      <Box
                        flex={3}
                        px={2}
                        borderLeftWidth={1}
                        borderLeftColor={theme.colors.muted[200]}
                      >
                        <Text fontSize="2xs" color={theme.colors.black[700]}>
                          {row.currentValue}
                        </Text>
                      </Box>
                    </HStack>
                  )}
                />
              </Box>
            </VStack>
          )}
        </VStack>
      ),
    });

  const addLocation = () => {
    const name = newLocationName.trim();
    if (!name) return;
    if (
      locations.some(
        (location) => getLocationKey(location) === getLocationKey(name),
      )
    ) {
      showDuplicateLocationsWarning([name]);
      return;
    }
    const pos = parseInt(insertAtPosition, 10);
    setLocations((prev) => {
      const next = [...prev];
      if (!isNaN(pos) && pos >= 1 && pos <= next.length + 1) {
        next.splice(pos - 1, 0, name);
      } else {
        next.push(name);
      }
      return next;
    });
    setNewLocationName('');
    setInsertAtPosition('');
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setLocations((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setLocations((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const removeLocation = (index: number) => {
    const locationName = locations[index];
    setLocations((prev) => prev.filter((_, i) => i !== index));
    queueLocationChange(locationName);
  };

  const onOpenRenameModal = (index: number) => {
    setRenameModalIndex(index);
    setRenameValue(locations[index]);
  };

  const onCloseRenameModal = () => {
    setRenameModalIndex(null);
    setRenameValue('');
  };

  const onConfirmRename = () => {
    if (renameModalIndex === null) return;
    const oldLocationName = locations[renameModalIndex];
    const newLocationName = renameValue.trim();

    if (!newLocationName || newLocationName === oldLocationName) {
      onCloseRenameModal();
      return;
    }
    if (
      locations.some(
        (loc, i) =>
          i !== renameModalIndex &&
          getLocationKey(loc) === getLocationKey(newLocationName),
      )
    ) {
      showDuplicateLocationsWarning([newLocationName]);
      return;
    }

    setLocations((prev) => {
      const next = [...prev];
      next[renameModalIndex] = newLocationName;
      return next;
    });
    queueLocationChange(oldLocationName, newLocationName);
    onCloseRenameModal();
  };

  const onToggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => !prev);
    setSelectedLocationIndices([]);
  };

  const onToggleLocationSelection = (index: number) => {
    setSelectedLocationIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const onSelectAllLocations = () => {
    setSelectedLocationIndices(locations.map((_, i) => i));
  };

  const onUnselectAllLocations = () => {
    setSelectedLocationIndices([]);
  };

  const onDeleteSelectedLocations = () => {
    setConfirmModalProps({
      isVisible: true,
      title: 'Deleting Locations',
      message: `Are you sure you want to delete ${selectedLocationIndices.length} location${selectedLocationIndices.length !== 1 ? 's' : ''}?`,
      onCancel: () => resetConfirmModalProps(setConfirmModalProps),
      onConfirm: () => {
        const locationNamesToRemove = locations.filter((_, i) =>
          selectedLocationIndices.includes(i),
        );
        setLocations((prev) =>
          prev.filter((_, i) => !selectedLocationIndices.includes(i)),
        );
        locationNamesToRemove.forEach((locationName) => {
          queueLocationChange(locationName);
        });
        setSelectedLocationIndices([]);
        setIsMultiSelectMode(false);
        resetConfirmModalProps(setConfirmModalProps);
      },
    });
  };

  const toggleExistingLocation = (loc: string) => {
    setCheckedExistingLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    );
  };

  const onSelectAllExistingLocations = () => {
    setCheckedExistingLocations(availableLocations);
  };

  const onUnselectAllExistingLocations = () => {
    setCheckedExistingLocations([]);
  };

  const onOpenExistingLocationsModal = () => {
    setCheckedExistingLocations([]);
    setIsExistingLocationsModalVisible(true);
  };

  const onCloseExistingLocationsModal = () => {
    setIsExistingLocationsModalVisible(false);
    setCheckedExistingLocations([]);
  };

  const onAddCheckedExistingLocations = () => {
    setLocations((prev) => [
      ...prev,
      ...checkedExistingLocations.filter((loc) => !prev.includes(loc)),
    ]);
    setIsExistingLocationsModalVisible(false);
    setCheckedExistingLocations([]);
  };

  const onImportLocationsFromFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',
          'text/csv',
          'text/comma-separated-values',
          'application/csv',
          '*/*',
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      const hasSupportedExtension = IMPORTABLE_FILE_EXTENSIONS.some((ext) =>
        asset.name?.toLowerCase().endsWith(ext),
      );
      if (!hasSupportedExtension) {
        dispatch(
          setError({
            statusCode: 500,
            message:
              'Unsupported file type. Please choose a .txt or .csv file.',
          }),
        );
        return;
      }

      const content = await FileSystem.readAsStringAsync(asset.uri);
      // Locations are expected to be comma-separated; also split on newlines
      // in case the file has one location per line.
      const parsedLocations = content
        .split(/[,\r\n]+/)
        .map((loc) => loc.trim())
        .filter(Boolean);

      if (parsedLocations.length === 0) {
        dispatch(
          setError({
            statusCode: 500,
            message: 'No locations were found in the selected file.',
          }),
        );
        return;
      }

      const existingLocationKeys = new Set(
        locations.map((location) => getLocationKey(location)),
      );
      const importedLocationKeys = new Set<string>();
      const locationsToAdd: string[] = [];
      const duplicateLocations: string[] = [];
      const duplicateLocationKeys = new Set<string>();

      parsedLocations.forEach((location) => {
        const locationKey = getLocationKey(location);
        if (
          existingLocationKeys.has(locationKey) ||
          importedLocationKeys.has(locationKey)
        ) {
          if (!duplicateLocationKeys.has(locationKey)) {
            duplicateLocations.push(location);
            duplicateLocationKeys.add(locationKey);
          }
          return;
        }

        importedLocationKeys.add(locationKey);
        locationsToAdd.push(location);
      });

      if (locationsToAdd.length > 0) {
        setLocations((prev) => [...prev, ...locationsToAdd]);
      }
      if (duplicateLocations.length > 0) {
        showDuplicateLocationsWarning(duplicateLocations);
      }
    } catch (error) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'Unable to import locations from the selected file.',
          error: error as any,
        }),
      );
    }
  };

  const moveLocationToIndex = (fromIndex: number, toIndexRaw: number) => {
    setLocations((prev) => {
      const next = [...prev];
      const clampedTarget = Math.max(0, Math.min(toIndexRaw, next.length - 1));
      const [item] = next.splice(fromIndex, 1);
      next.splice(clampedTarget, 0, item);
      return next;
    });
  };

  const onOpenMoveModal = (index: number) => {
    setMoveModalIndex(index);
    setMoveIndexInput(String(index + 1));
    setMoveRelativeLocation(null);
    setMovePosition('after');
  };

  const onCloseMoveModal = () => {
    setMoveModalIndex(null);
    setMoveIndexInput('');
    setMoveRelativeLocation(null);
    setMovePosition('after');
  };

  const onSelectMoveRelativeLocation = (
    loc: string,
    position: 'before' | 'after',
  ) => {
    setMoveRelativeLocation(loc);
    setMovePosition(position);
  };

  const onConfirmMove = () => {
    if (moveModalIndex === null) return;

    if (moveRelativeLocation) {
      const relIndex = locations.indexOf(moveRelativeLocation);
      if (relIndex === -1 || relIndex === moveModalIndex) {
        onCloseMoveModal();
        return;
      }
      // Account for the shift caused by removing the item being moved.
      const adjustedRelIndex =
        relIndex > moveModalIndex ? relIndex - 1 : relIndex;
      const targetIndex =
        movePosition === 'before' ? adjustedRelIndex : adjustedRelIndex + 1;
      moveLocationToIndex(moveModalIndex, targetIndex);
    } else {
      const parsed = parseInt(moveIndexInput, 10);
      if (isNaN(parsed)) {
        onCloseMoveModal();
        return;
      }
      moveLocationToIndex(moveModalIndex, parsed - 1);
    }
    onCloseMoveModal();
  };

  const onAssignItems = (location: string) => {
    // @ts-ignore
    navigation.navigate(Routes.LocationItemAssignmentScreen, {
      storeId,
      storeName,
      location,
      routeId: stableRouteId,
    });
  };

  const onOpenUnassignedItems = () => {
    // @ts-ignore
    navigation.navigate(Routes.RouteUnassignedItemsScreen, {
      storeId,
      storeName,
      routeId: stableRouteId,
      locations,
    });
  };

  const onSave = () => {
    if (!canSave) return;
    const payload = {
      id: stableRouteId,
      name: routeName.trim(),
      locations,
      storeId,
      userId: account._id ?? '',
      userIdsWithAccess: [],
    };

    // saveStoreRoutes handles deciding add vs. update, dispatching the local
    // slice action, and persisting just the routes field to the backend.
    dispatch(saveStoreRoutes({ storeId, route: payload }));

    // Renames/deletes of locations are only queued locally as they happen;
    // flush them to the storeSpecificValues map now that the route itself
    // is actually being saved.
    Object.entries(pendingLocationChangesRef.current).forEach(
      ([oldLocationName, newLocationName]) => {
        dispatch(
          updateItemsForRouteLocationChange({
            routeId: stableRouteId,
            oldLocationName,
            newLocationName: newLocationName || undefined,
          }),
        );
      },
    );
    pendingLocationChangesRef.current = {};

    markAsSaved();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <VStack flex={1} bg="white">
        {/* Route name */}
        <Box
          px={4}
          py={3}
          borderBottomWidth={1}
          borderBottomColor={theme.colors.muted[200]}
        >
          <Text
            fontSize="xs"
            fontWeight="700"
            color={theme.colors.muted[500]}
            mb={1}
          >
            Route name
          </Text>
          <Input
            value={routeName}
            onChangeText={setRouteName}
            placeholder="e.g. Main Shopping Route"
            variant="outline"
          />
        </Box>

        {/* Add location row */}
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
            Add location
          </Text>
          {availableLocations.length > 0 && (
            <Pressable
              onPress={onOpenExistingLocationsModal}
              borderWidth={1.5}
              borderColor={theme.colors.primary[600]}
              borderRadius={8}
              px={3}
              py={2}
              mb={3}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              _pressed={{ opacity: 0.5 }}
            >
              <FontAwesome
                name="list-ul"
                size={12}
                color={theme.colors.primary[600]}
                style={{ marginRight: 8 }}
              />
              <Text
                fontSize="xs"
                fontWeight="700"
                color={theme.colors.primary[700]}
              >
                Choose from existing locations
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={onImportLocationsFromFile}
            borderWidth={1.5}
            borderColor={theme.colors.muted[300]}
            borderRadius={8}
            px={3}
            py={2}
            mb={3}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            _pressed={{ opacity: 0.5 }}
          >
            <FontAwesome
              name="file-text-o"
              size={12}
              color={theme.colors.muted[600]}
              style={{ marginRight: 8 }}
            />
            <Text
              fontSize="xs"
              fontWeight="700"
              color={theme.colors.muted[600]}
            >
              Import from .txt/.csv file
            </Text>
          </Pressable>
          <HStack space={2} alignItems="center">
            <Input
              flex={4}
              value={newLocationName}
              onChangeText={setNewLocationName}
              placeholder="Location name (e.g. Produce)"
              variant="outline"
              h={9}
            />
            <Input
              w={14}
              flex={1}
              value={insertAtPosition}
              onChangeText={setInsertAtPosition}
              placeholder="#"
              keyboardType="numeric"
              variant="outline"
              h={9}
              textAlign="center"
            />
            <Pressable
              onPress={addLocation}
              bg={theme.colors.primary[600]}
              borderRadius={8}
              px={4}
              h={9}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              opacity={newLocationName.trim() ? 1 : 0.4}
              shadow={newLocationName.trim() ? 2 : 0}
              _pressed={{ opacity: 0.5 }}
            >
              <FontAwesome
                name="plus"
                size={12}
                color="white"
                style={{ marginRight: 6 }}
              />
              <Text color="white" fontWeight="700" fontSize="sm">
                Add
              </Text>
            </Pressable>
          </HStack>
          <Text fontSize="2xs" color={theme.colors.muted[400]} mt={1}>
            Leave # blank to append at the end
          </Text>
        </Box>

        {/* Locations list header */}
        <HStack
          px={4}
          py={2}
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor={theme.colors.muted[200]}
        >
          <Text fontSize="xs" fontWeight="700" color={theme.colors.muted[500]}>
            Locations ({locations.length})
          </Text>
          <HStack space={3} alignItems="center">
            <Pressable
              onPress={onOpenUnassignedItems}
              isDisabled={locations.length === 0}
              opacity={locations.length === 0 ? 0.4 : 1}
              hitSlop={8}
            >
              <Text
                fontSize="xs"
                fontWeight="700"
                color={theme.colors.primary[600]}
                numberOfLines={1}
              >
                Manage
              </Text>
            </Pressable>
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
        </HStack>
        {isMultiSelectMode && (
          <HStack
            px={4}
            py={2}
            space={2}
            borderBottomWidth={1}
            borderBottomColor={theme.colors.muted[200]}
          >
            <Pressable
              flex={1}
              onPress={
                selectedLocationIndices.length === locations.length
                  ? onUnselectAllLocations
                  : onSelectAllLocations
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
                {selectedLocationIndices.length === locations.length
                  ? 'Unselect All'
                  : 'Select All'}
              </Text>
            </Pressable>
            <Pressable
              flex={1}
              onPress={onDeleteSelectedLocations}
              isDisabled={selectedLocationIndices.length === 0}
              opacity={selectedLocationIndices.length === 0 ? 0.4 : 1}
              bg={theme.colors.red[500]}
              borderRadius={6}
              py={1.5}
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Text
                fontSize="xs"
                fontWeight="700"
                color={theme.colors.muted[100]}
              >
                Delete ({selectedLocationIndices.length})
              </Text>
            </Pressable>
          </HStack>
        )}

        {/* Locations list */}
        <FlatList
          data={locations}
          keyExtractor={(_, i) => String(i)}
          extraData={{ isMultiSelectMode, selectedLocationIndices }}
          ListEmptyComponent={
            <Box px={4} py={6} alignItems="center">
              <Text color={theme.colors.muted[400]} fontSize="sm">
                No locations yet. Add one above.
              </Text>
            </Box>
          }
          renderItem={({ item: loc, index }) => {
            const isSelected = selectedLocationIndices.includes(index);
            return (
              <Pressable
                onPress={() =>
                  isMultiSelectMode
                    ? onToggleLocationSelection(index)
                    : undefined
                }
                _pressed={isMultiSelectMode ? { opacity: 0.5 } : undefined}
              >
                <HStack
                  px={4}
                  py={3}
                  alignItems="center"
                  borderBottomWidth={0.5}
                  borderBottomColor={theme.colors.muted[200]}
                  space={3}
                >
                  {isMultiSelectMode && (
                    <FontAwesome
                      name={isSelected ? 'check-square' : 'square-o'}
                      size={18}
                      color={
                        isSelected
                          ? theme.colors.primary[600]
                          : theme.colors.muted[400]
                      }
                    />
                  )}
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color={theme.colors.muted[400]}
                    w={6}
                    textAlign="right"
                  >
                    {index + 1}
                  </Text>
                  <Text
                    flex={1}
                    fontSize="sm"
                    fontWeight="500"
                    color={theme.colors.dark[400]}
                    numberOfLines={1}
                  >
                    {loc}
                  </Text>
                  {!isMultiSelectMode && (
                    <HStack space={1.5}>
                      <Pressable
                        onPress={() => onAssignItems(loc)}
                        hitSlop={8}
                        w={8}
                        h={8}
                        borderRadius={16}
                        bg={theme.colors.primary[50]}
                        alignItems="center"
                        justifyContent="center"
                        _pressed={{ opacity: 0.5 }}
                      >
                        <FontAwesome
                          name="list"
                          size={13}
                          color={theme.colors.primary[600]}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => moveUp(index)}
                        opacity={index === 0 ? 0.3 : 1}
                        hitSlop={8}
                        w={8}
                        h={8}
                        borderRadius={16}
                        bg={theme.colors.muted[100]}
                        alignItems="center"
                        justifyContent="center"
                        _pressed={{ opacity: 0.5 }}
                      >
                        <FontAwesome
                          name="chevron-up"
                          size={13}
                          color={theme.colors.muted[600]}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => moveDown(index)}
                        opacity={index === locations.length - 1 ? 0.3 : 1}
                        hitSlop={8}
                        w={8}
                        h={8}
                        borderRadius={16}
                        bg={theme.colors.muted[100]}
                        alignItems="center"
                        justifyContent="center"
                        _pressed={{ opacity: 0.5 }}
                      >
                        <FontAwesome
                          name="chevron-down"
                          size={13}
                          color={theme.colors.muted[600]}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => onOpenMoveModal(index)}
                        hitSlop={8}
                        w={8}
                        h={8}
                        borderRadius={16}
                        bg={theme.colors.muted[100]}
                        alignItems="center"
                        justifyContent="center"
                        _pressed={{ opacity: 0.5 }}
                      >
                        <FontAwesome
                          name="arrows-v"
                          size={13}
                          color={theme.colors.muted[600]}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => onOpenRenameModal(index)}
                        hitSlop={8}
                        w={8}
                        h={8}
                        borderRadius={16}
                        bg={theme.colors.muted[100]}
                        alignItems="center"
                        justifyContent="center"
                        _pressed={{ opacity: 0.5 }}
                      >
                        <FontAwesome
                          name="pencil"
                          size={13}
                          color={theme.colors.muted[600]}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => removeLocation(index)}
                        hitSlop={8}
                        w={8}
                        h={8}
                        borderRadius={16}
                        bg={theme.colors.red[50]}
                        alignItems="center"
                        justifyContent="center"
                        _pressed={{ opacity: 0.5 }}
                      >
                        <FontAwesome
                          name="times"
                          size={13}
                          color={theme.colors.red[500]}
                        />
                      </Pressable>
                    </HStack>
                  )}
                </HStack>
              </Pressable>
            );
          }}
        />

        {/* Save button */}
        <Box
          px={4}
          py={3}
          borderTopWidth={1}
          borderTopColor={theme.colors.muted[200]}
        >
          <Button
            isDisabled={!canSave}
            onPress={onSave}
            borderRadius={8}
            shadow={canSave ? 2 : 0}
            _text={{ fontWeight: '700' }}
          >
            {existingRoute ? 'Update Route' : 'Save Route'}
          </Button>
        </Box>
      </VStack>
      <ModalWithBlur
        isVisible={isExistingLocationsModalVisible}
        title="Choose Existing Locations"
        onCancel={onCloseExistingLocationsModal}
        onConfirm={onAddCheckedExistingLocations}
        cancelButton={{ text: 'Cancel', colorScheme: 'muted' }}
        confirmButton={{
          text: `Add Selected (${checkedExistingLocations.length})`,
          isEnabled: checkedExistingLocations.length > 0,
        }}
        containerStyles={{
          width: '90%',
          height: '100%',
          maxWidth: '800px',
        }}
      >
        <HStack space={2} mb={3}>
          <Pressable
            flex={1}
            onPress={onSelectAllExistingLocations}
            borderWidth={1.5}
            borderColor={theme.colors.primary[600]}
            borderRadius={8}
            py={2}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            _pressed={{ opacity: 0.5 }}
          >
            <FontAwesome
              name="check-square-o"
              size={13}
              color={theme.colors.primary[600]}
              style={{ marginRight: 6 }}
            />
            <Text
              color={theme.colors.primary[700]}
              fontWeight="700"
              fontSize="sm"
            >
              Select All
            </Text>
          </Pressable>
          <Pressable
            flex={1}
            onPress={onUnselectAllExistingLocations}
            borderWidth={1.5}
            borderColor={theme.colors.muted[300]}
            borderRadius={8}
            py={2}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            _pressed={{ opacity: 0.5 }}
          >
            <FontAwesome
              name="square-o"
              size={13}
              color={theme.colors.muted[600]}
              style={{ marginRight: 6 }}
            />
            <Text
              color={theme.colors.muted[600]}
              fontWeight="700"
              fontSize="sm"
            >
              Unselect All
            </Text>
          </Pressable>
        </HStack>
        <FlashList<string>
          data={availableLocations}
          keyExtractor={(loc) => loc}
          estimatedItemSize={44}
          ListEmptyComponent={
            <Box py={4} alignItems="center">
              <Text color={theme.colors.muted[400]} fontSize="sm">
                No existing locations for this store.
              </Text>
            </Box>
          }
          renderItem={({ item: loc }) => {
            const isChecked = checkedExistingLocations.includes(loc);
            return (
              <Pressable
                onPress={() => toggleExistingLocation(loc)}
                _pressed={{ opacity: 0.5 }}
              >
                <HStack
                  alignItems="center"
                  py={2.5}
                  borderBottomWidth={0.5}
                  borderBottomColor={theme.colors.muted[200]}
                  space={3}
                >
                  <Box
                    width={5}
                    height={5}
                    borderRadius={4}
                    borderWidth={2}
                    borderColor={
                      isChecked
                        ? theme.colors.primary[600]
                        : theme.colors.muted[300]
                    }
                    bg={isChecked ? theme.colors.primary[600] : 'transparent'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {isChecked && (
                      <FontAwesome name="check" size={12} color="white" />
                    )}
                  </Box>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={theme.colors.dark[400]}
                  >
                    {loc}
                  </Text>
                </HStack>
              </Pressable>
            );
          }}
        />
      </ModalWithBlur>
      <ModalWithBlur
        isVisible={moveModalIndex !== null}
        title={
          moveModalIndex !== null
            ? `Move '${locations[moveModalIndex]}'`
            : 'Move Location'
        }
        onCancel={onCloseMoveModal}
        onConfirm={onConfirmMove}
        cancelButton={{ text: 'Cancel', colorScheme: 'muted' }}
        confirmButton={{
          text: 'Move',
          isEnabled:
            !!moveRelativeLocation ||
            (!isNaN(parseInt(moveIndexInput, 10)) && moveIndexInput !== ''),
        }}
        containerStyles={{
          width: '90%',
          height: '100%',
          maxWidth: '800px',
        }}
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          color={theme.colors.muted[500]}
          mb={1}
        >
          Move to position #
        </Text>
        <Input
          value={moveIndexInput}
          onChangeText={(text) => {
            setMoveIndexInput(text);
            setMoveRelativeLocation(null);
          }}
          placeholder={`1 - ${locations.length}`}
          keyboardType="numeric"
          variant="outline"
          mb={3}
        />
        <Text
          fontSize="xs"
          fontWeight="700"
          color={theme.colors.muted[500]}
          mb={2}
        >
          Or choose a location to move it before/after
        </Text>
        <FlashList<string>
          data={
            moveModalIndex !== null
              ? locations.filter((_, i) => i !== moveModalIndex)
              : []
          }
          keyExtractor={(loc) => loc}
          estimatedItemSize={52}
          ListEmptyComponent={
            <Box py={4} alignItems="center">
              <Text color={theme.colors.muted[400]} fontSize="sm">
                No other locations in this route.
              </Text>
            </Box>
          }
          renderItem={({ item: loc }) => {
            const isSelected = moveRelativeLocation === loc;
            return (
              <HStack
                alignItems="center"
                justifyContent="space-between"
                py={2}
                borderBottomWidth={0.5}
                borderBottomColor={theme.colors.muted[200]}
                space={2}
              >
                <Text
                  flex={1}
                  fontSize="sm"
                  fontWeight="500"
                  color={theme.colors.dark[400]}
                  numberOfLines={1}
                >
                  {loc}
                </Text>
                <HStack space={1.5}>
                  <Pressable
                    onPress={() => onSelectMoveRelativeLocation(loc, 'before')}
                    borderWidth={1.5}
                    borderColor={
                      isSelected && movePosition === 'before'
                        ? theme.colors.primary[600]
                        : theme.colors.muted[300]
                    }
                    bg={
                      isSelected && movePosition === 'before'
                        ? theme.colors.primary[50]
                        : 'transparent'
                    }
                    borderRadius={6}
                    px={2}
                    py={1}
                    _pressed={{ opacity: 0.5 }}
                  >
                    <Text
                      fontSize="2xs"
                      fontWeight="700"
                      color={
                        isSelected && movePosition === 'before'
                          ? theme.colors.primary[700]
                          : theme.colors.muted[600]
                      }
                    >
                      Before
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onSelectMoveRelativeLocation(loc, 'after')}
                    borderWidth={1.5}
                    borderColor={
                      isSelected && movePosition === 'after'
                        ? theme.colors.primary[600]
                        : theme.colors.muted[300]
                    }
                    bg={
                      isSelected && movePosition === 'after'
                        ? theme.colors.primary[50]
                        : 'transparent'
                    }
                    borderRadius={6}
                    px={2}
                    py={1}
                    _pressed={{ opacity: 0.5 }}
                  >
                    <Text
                      fontSize="2xs"
                      fontWeight="700"
                      color={
                        isSelected && movePosition === 'after'
                          ? theme.colors.primary[700]
                          : theme.colors.muted[600]
                      }
                    >
                      After
                    </Text>
                  </Pressable>
                </HStack>
              </HStack>
            );
          }}
        />
      </ModalWithBlur>
      <ModalWithBlur
        isVisible={renameModalIndex !== null}
        title={
          renameModalIndex !== null
            ? `Rename '${locations[renameModalIndex]}'`
            : 'Rename Location'
        }
        onCancel={onCloseRenameModal}
        onConfirm={onConfirmRename}
        cancelButton={{ text: 'Cancel', colorScheme: 'muted' }}
        confirmButton={{
          text: 'Rename',
          isEnabled: renameValue.trim().length > 0,
        }}
        containerStyles={{
          width: '90%',
          maxWidth: '800px',
        }}
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          color={theme.colors.muted[500]}
          mb={1}
        >
          New name
        </Text>
        <Input
          value={renameValue}
          onChangeText={setRenameValue}
          placeholder="Location name"
          variant="outline"
          autoFocus
        />
      </ModalWithBlur>
      <ConfirmModal {...confirmModalProps} />
      <ConfirmModal {...unsavedChangesModalProps} />
    </KeyboardAvoidingView>
  );
}
