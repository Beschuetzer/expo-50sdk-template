import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Box, HStack, Pressable, Text, useTheme, VStack } from 'native-base';
import { useLayoutEffect, useState } from 'react';
import { FlatList } from 'react-native';

import {
  ConfirmModal,
  ConfirmModalProps,
} from '@/components/modals/ConfirmModal';
import { Routes } from '@/constants/navigation';
import {
  activeRouteIdSelector,
  routesForStoreSelector,
  setActiveRouteId,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import {
  saveStoreRoutes,
  getStoreRoutes,
  deleteStoreRoutes,
} from '@/state/thunks';
import { Route } from '@/types/Store';
import { resetConfirmModalProps } from '@/utils/helpers';

export default function RouteSelectionScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { storeId, storeName } = (route.params || {}) as {
    storeId: string;
    storeName?: string;
  };

  const storeRoutes = useAppSelector(routesForStoreSelector(storeId));
  const activeRouteId = useAppSelector(activeRouteIdSelector(storeId));
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {} as ConfirmModalProps,
  );
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);

  const onToggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => !prev);
    setSelectedRouteIds([]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: storeName ? `Routes — ${storeName}` : 'Select a Route',
      headerRight: () => (
        <Pressable onPress={onToggleMultiSelectMode} hitSlop={8} px={3} py={1}>
          <Text
            fontSize="sm"
            fontWeight="700"
            color={theme.colors.primary[600]}
          >
            {isMultiSelectMode ? 'Cancel' : 'Select'}
          </Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, storeName, isMultiSelectMode]);

  const onClose = () => {
    navigation.goBack();
  };

  const onSelectRoute = (route: Route) => {
    dispatch(setActiveRouteId({ storeId, routeId: route.id }));
    onClose();
  };

  const onClearRoute = () => {
    dispatch(setActiveRouteId({ storeId, routeId: null }));
    onClose();
  };

  const onEditRoute = (route: Route) => {
    // @ts-ignore
    navigation.navigate(Routes.RouteCreationScreen, {
      storeId,
      storeName,
      routeId: route.id,
    });
  };

  const onDeleteRoute = (route: Route) => {
    setConfirmModalProps({
      isVisible: true,
      title: 'Deleting Route',
      message: `Are you sure you want to delete '${route.name}'?`,
      onCancel: () => resetConfirmModalProps(setConfirmModalProps),
      onConfirm: () => {
        dispatch(deleteStoreRoutes({ storeId, ids: [route.id] }));
        resetConfirmModalProps(setConfirmModalProps);
      },
    });
  };

  const onCreateNew = () => {
    // @ts-ignore
    navigation.navigate(Routes.RouteCreationScreen, { storeId, storeName });
  };

  const onToggleRouteSelection = (route: Route) => {
    setSelectedRouteIds((prev) =>
      prev.includes(route.id)
        ? prev.filter((id) => id !== route.id)
        : [...prev, route.id],
    );
  };

  const onSelectAll = () => {
    setSelectedRouteIds(storeRoutes.map((r) => r.id));
  };

  const onUnselectAll = () => {
    setSelectedRouteIds([]);
  };

  const onDeleteSelected = () => {
    setConfirmModalProps({
      isVisible: true,
      title: 'Deleting Routes',
      message: `Are you sure you want to delete ${selectedRouteIds.length} route${selectedRouteIds.length !== 1 ? 's' : ''}?`,
      onCancel: () => resetConfirmModalProps(setConfirmModalProps),
      onConfirm: () => {
        dispatch(deleteStoreRoutes({ storeId, ids: selectedRouteIds }));
        setSelectedRouteIds([]);
        setIsMultiSelectMode(false);
        resetConfirmModalProps(setConfirmModalProps);
      },
    });
  };

  const onDownloadRoutes = async () => {
    const result = await dispatch(getStoreRoutes({ storeId })).unwrap();
    if (result?.conflicts?.length) {
      // @ts-ignore
      navigation.navigate(Routes.RouteConflictResolutionScreen, {
        storeId,
        conflicts: result.conflicts,
      });
    } else {
      // No conflicts to resolve, so the merged set is already final locally.
      // Persist it back to the database.
      dispatch(saveStoreRoutes({ storeId }));
    }
  };

  const renderItem = ({ item: route }: { item: Route }) => {
    const isActive = route.id === activeRouteId;
    const isSelected = selectedRouteIds.includes(route.id);
    return (
      <HStack
        px={4}
        py={3}
        alignItems="center"
        space={3}
        borderBottomWidth={0.5}
        borderBottomColor={theme.colors.muted[200]}
        bg={isActive ? theme.colors.primary[50] : 'transparent'}
      >
        {isMultiSelectMode && (
          <Pressable
            onPress={() => onToggleRouteSelection(route)}
            hitSlop={8}
            p={1}
            _pressed={{ opacity: 0.5 }}
          >
            <FontAwesome
              name={isSelected ? 'check-square' : 'square-o'}
              size={18}
              color={
                isSelected ? theme.colors.primary[600] : theme.colors.muted[400]
              }
            />
          </Pressable>
        )}
        <Pressable
          flex={1}
          onPress={() =>
            isMultiSelectMode
              ? onToggleRouteSelection(route)
              : onSelectRoute(route)
          }
          _pressed={{ opacity: 0.5 }}
        >
          <VStack>
            <HStack alignItems="center" space={2}>
              {isActive && (
                <FontAwesome
                  name="check-circle"
                  size={14}
                  color={theme.colors.primary[600]}
                />
              )}
              <Text
                fontWeight="600"
                fontSize="sm"
                color={
                  isActive ? theme.colors.primary[700] : theme.colors.dark[300]
                }
              >
                {route.name}
              </Text>
            </HStack>
            <Text fontSize="2xs" color={theme.colors.muted[500]} mt={0.5}>
              {route.locations.length} location
              {route.locations.length !== 1 ? 's' : ''}:{' '}
              {route.locations.slice(0, 3).join(' → ')}
              {route.locations.length > 3 ? ' …' : ''}
            </Text>
          </VStack>
        </Pressable>
        {!isMultiSelectMode && (
          <>
            <Pressable
              onPress={() => onEditRoute(route)}
              hitSlop={8}
              p={2}
              _pressed={{ opacity: 0.5 }}
            >
              <FontAwesome
                name="pencil"
                size={14}
                color={theme.colors.muted[500]}
              />
            </Pressable>
            <Pressable
              onPress={() => onDeleteRoute(route)}
              hitSlop={8}
              p={2}
              _pressed={{ opacity: 0.5 }}
            >
              <FontAwesome
                name="trash"
                size={14}
                color={theme.colors.red[400]}
              />
            </Pressable>
          </>
        )}
      </HStack>
    );
  };

  return (
    <VStack flex={1} bg="white">
      <FlatList
        data={storeRoutes}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Box px={4} py={4} alignItems="center">
            <Text color={theme.colors.muted[400]} fontSize="sm">
              No routes for this store yet.
            </Text>
          </Box>
        }
      />
      <HStack
        px={4}
        py={3}
        space={2}
        borderTopWidth={1}
        borderTopColor={theme.colors.muted[200]}
      >
        {isMultiSelectMode ? (
          <>
            <Pressable
              flex={1}
              onPress={
                selectedRouteIds.length === storeRoutes.length
                  ? onUnselectAll
                  : onSelectAll
              }
              bg={theme.colors.muted[200]}
              borderRadius={6}
              py={2}
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Text
                color={theme.colors.muted[600]}
                fontWeight="700"
                fontSize="sm"
              >
                {selectedRouteIds.length === storeRoutes.length
                  ? 'Unselect All'
                  : 'Select All'}
              </Text>
            </Pressable>
            <Pressable
              flex={1}
              onPress={onDeleteSelected}
              isDisabled={selectedRouteIds.length === 0}
              opacity={selectedRouteIds.length === 0 ? 0.4 : 1}
              bg={theme.colors.red[500]}
              borderRadius={6}
              py={2}
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Text
                color={theme.colors.muted[100]}
                fontWeight="700"
                fontSize="sm"
              >
                Delete ({selectedRouteIds.length})
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              flex={1}
              onPress={onCreateNew}
              bg={theme.colors.primary[600]}
              borderRadius={6}
              py={2}
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Text color="white" fontWeight="700" fontSize="sm">
                Add Route
              </Text>
            </Pressable>
            <Pressable
              flex={1}
              onPress={onDownloadRoutes}
              bg={theme.colors.muted[200]}
              borderRadius={6}
              py={2}
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Text
                color={theme.colors.muted[600]}
                fontWeight="700"
                fontSize="sm"
              >
                Sync Routes
              </Text>
            </Pressable>
            {activeRouteId && (
              <Pressable
                flex={1}
                onPress={onClearRoute}
                bg={theme.colors.red[500]}
                borderRadius={6}
                py={2}
                alignItems="center"
                _pressed={{ opacity: 0.5 }}
              >
                <Text
                  color={theme.colors.muted[100]}
                  fontWeight="700"
                  fontSize="sm"
                >
                  Clear Route
                </Text>
              </Pressable>
            )}
          </>
        )}
      </HStack>
      <ConfirmModal {...confirmModalProps} />
    </VStack>
  );
}
