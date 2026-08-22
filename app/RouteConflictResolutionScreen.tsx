import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import _ from 'lodash';
import {
  Box,
  Button,
  HStack,
  Pressable,
  Text,
  useTheme,
  VStack,
} from 'native-base';
import { useState } from 'react';

import { updateRoute } from '@/state/slices/listsSlice';
import { useAppDispatch } from '@/state/store';
import { RouteConflict, saveStoreRoutes } from '@/state/thunks';
import { Route } from '@/types/Store';

type IndexDiff = {
  index: number;
  localValue: string;
  remoteValue: string;
};

type FieldDiff = {
  field: string;
  localValue: string;
  remoteValue: string;
  /**
   *Index-based table rows describing how an array field differs.
   *Populated instead of a simple before/after comparison for array fields
   *(e.g. `locations`) since showing the full arrays side-by-side isn't
   *useful once they get long.
   **/
  details?: IndexDiff[];
};

const DIFFABLE_FIELDS: { key: keyof Route; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'locations', label: 'Locations' },
  { key: 'userIdsWithAccess', label: 'Shared With' },
];

const ARRAY_FIELD_KEYS: (keyof Route)[] = ['locations', 'userIdsWithAccess'];

const NONE_PLACEHOLDER = '(none)';

function formatFieldValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : NONE_PLACEHOLDER;
  }
  return value ? String(value) : NONE_PLACEHOLDER;
}

/**
 *Compares two arrays index by index and returns a row for each index that
 *differs. This makes it possible to pinpoint exactly what changed even
 *when the arrays are long (e.g. a route with 100 locations).
 **/
function getArrayIndexDiffs(local: unknown[], remote: unknown[]): IndexDiff[] {
  const diffs: IndexDiff[] = [];
  const maxLength = Math.max(local.length, remote.length);

  for (let i = 0; i < maxLength; i++) {
    const localValue = local[i];
    const remoteValue = remote[i];
    if (_.isEqual(localValue, remoteValue)) continue;

    diffs.push({
      index: i,
      localValue:
        localValue !== undefined ? String(localValue) : NONE_PLACEHOLDER,
      remoteValue:
        remoteValue !== undefined ? String(remoteValue) : NONE_PLACEHOLDER,
    });
  }

  return diffs;
}

function getFieldDiffs(local: Route, remote: Route): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  for (const { key, label } of DIFFABLE_FIELDS) {
    if (_.isEqual(local[key], remote[key])) continue;

    if (ARRAY_FIELD_KEYS.includes(key)) {
      const localArray = (local[key] as unknown[]) ?? [];
      const remoteArray = (remote[key] as unknown[]) ?? [];
      const itemLabel = key === 'locations' ? 'location' : 'user id';
      diffs.push({
        field: label,
        localValue: `${localArray.length} ${itemLabel}${localArray.length !== 1 ? 's' : ''}`,
        remoteValue: `${remoteArray.length} ${itemLabel}${remoteArray.length !== 1 ? 's' : ''}`,
        details: getArrayIndexDiffs(localArray, remoteArray),
      });
    } else {
      diffs.push({
        field: label,
        localValue: formatFieldValue(local[key]),
        remoteValue: formatFieldValue(remote[key]),
      });
    }
  }
  return diffs;
}

export default function RouteConflictResolutionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { storeId, conflicts } = (route.params || {}) as {
    storeId: string;
    conflicts: RouteConflict[];
  };

  const [resolutions, setResolutions] = useState<
    Record<string, 'local' | 'remote'>
  >(() =>
    (conflicts || []).reduce(
      (acc, conflict) => ({ ...acc, [conflict.local.id]: 'local' }),
      {} as Record<string, 'local' | 'remote'>,
    ),
  );

  const setResolution = (routeId: string, resolution: 'local' | 'remote') => {
    setResolutions((prev) => ({ ...prev, [routeId]: resolution }));
  };

  const onApply = () => {
    for (const conflict of conflicts || []) {
      if (resolutions[conflict.local.id] === 'remote') {
        dispatch(updateRoute(conflict.remote));
      }
    }
    dispatch(saveStoreRoutes({ storeId }));
    navigation.goBack();
  };

  const renderItem = ({ item: conflict }: { item: RouteConflict }) => {
    const resolution = resolutions[conflict.local.id] ?? 'local';
    const fieldDiffs = getFieldDiffs(conflict.local, conflict.remote);

    return (
      <Box
        px={4}
        py={3}
        borderBottomWidth={1}
        borderBottomColor={theme.colors.muted[200]}
      >
        <Text
          fontWeight="700"
          fontSize="sm"
          color={theme.colors.dark[100]}
          mb={2}
        >
          '{conflict.remote.name || conflict.local.name}'
        </Text>

        <VStack space={2} mb={3}>
          {fieldDiffs.map((diff) => (
            <Box
              key={diff.field}
              bg={theme.colors.muted[50]}
              borderRadius={6}
              px={3}
              py={2}
            >
              <Text
                fontSize="2xs"
                fontWeight="700"
                color={theme.colors.muted[500]}
                mb={1}
              >
                {diff.field}
              </Text>
              <HStack space={2}>
                <VStack flex={1}>
                  <Text fontSize="2xs" color={theme.colors.muted[400]}>
                    On Device
                  </Text>
                  <Text fontSize="xs" color={theme.colors.black[700]}>
                    {diff.localValue}
                  </Text>
                </VStack>
                <VStack flex={1}>
                  <Text fontSize="2xs" color={theme.colors.muted[400]}>
                    In Database
                  </Text>
                  <Text fontSize="xs" color={theme.colors.black[700]}>
                    {diff.remoteValue}
                  </Text>
                </VStack>
              </HStack>
              {diff.details && diff.details.length > 0 && (
                <VStack
                  mt={2}
                  borderWidth={1}
                  borderColor={theme.colors.muted[200]}
                  borderRadius={4}
                  overflow="hidden"
                >
                  <HStack bg={theme.colors.muted[100]}>
                    <Box flex={1} px={2} py={1}>
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
                      py={1}
                      borderLeftWidth={1}
                      borderLeftColor={theme.colors.muted[200]}
                    >
                      <Text
                        fontSize="2xs"
                        fontWeight="700"
                        color={theme.colors.muted[600]}
                      >
                        On Device
                      </Text>
                    </Box>
                    <Box
                      flex={3}
                      px={2}
                      py={1}
                      borderLeftWidth={1}
                      borderLeftColor={theme.colors.muted[200]}
                    >
                      <Text
                        fontSize="2xs"
                        fontWeight="700"
                        color={theme.colors.muted[600]}
                      >
                        In Database
                      </Text>
                    </Box>
                  </HStack>
                  {diff.details.map((row) => (
                    <HStack
                      key={row.index}
                      borderTopWidth={1}
                      borderTopColor={theme.colors.muted[200]}
                    >
                      <Box flex={1} px={2} py={1}>
                        <Text fontSize="2xs" color={theme.colors.black[600]}>
                          {row.index}
                        </Text>
                      </Box>
                      <Box
                        flex={3}
                        px={2}
                        py={1}
                        borderLeftWidth={1}
                        borderLeftColor={theme.colors.muted[200]}
                      >
                        <Text fontSize="2xs" color={theme.colors.black[700]}>
                          {row.localValue}
                        </Text>
                      </Box>
                      <Box
                        flex={3}
                        px={2}
                        py={1}
                        borderLeftWidth={1}
                        borderLeftColor={theme.colors.muted[200]}
                      >
                        <Text fontSize="2xs" color={theme.colors.black[700]}>
                          {row.remoteValue}
                        </Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          ))}
        </VStack>

        <HStack space={2}>
          <Pressable
            flex={1}
            onPress={() => setResolution(conflict.local.id, 'local')}
            borderWidth={1.5}
            borderColor={
              resolution === 'local'
                ? theme.colors.primary[600]
                : theme.colors.muted[300]
            }
            bg={
              resolution === 'local' ? theme.colors.primary[50] : 'transparent'
            }
            borderRadius={8}
            py={2}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            _pressed={{ opacity: 0.5 }}
          >
            {resolution === 'local' && (
              <FontAwesome
                name="check"
                size={12}
                color={theme.colors.primary[600]}
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              fontSize="xs"
              fontWeight="700"
              color={
                resolution === 'local'
                  ? theme.colors.primary[700]
                  : theme.colors.muted[600]
              }
            >
              Keep On Device
            </Text>
          </Pressable>
          <Pressable
            flex={1}
            onPress={() => setResolution(conflict.local.id, 'remote')}
            borderWidth={1.5}
            borderColor={
              resolution === 'remote'
                ? theme.colors.primary[600]
                : theme.colors.muted[300]
            }
            bg={
              resolution === 'remote' ? theme.colors.primary[50] : 'transparent'
            }
            borderRadius={8}
            py={2}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            _pressed={{ opacity: 0.5 }}
          >
            {resolution === 'remote' && (
              <FontAwesome
                name="check"
                size={12}
                color={theme.colors.primary[600]}
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              fontSize="xs"
              fontWeight="700"
              color={
                resolution === 'remote'
                  ? theme.colors.primary[700]
                  : theme.colors.muted[600]
              }
            >
              Use Database Version
            </Text>
          </Pressable>
        </HStack>
      </Box>
    );
  };

  return (
    <VStack flex={1} bg="white">
      <Box
        px={4}
        py={3}
        bg={theme.colors.muted[50]}
        borderBottomWidth={1}
        borderBottomColor={theme.colors.muted[200]}
      >
        <Text fontSize="xs" color={theme.colors.muted[600]}>
          {(conflicts || []).length} route
          {(conflicts || []).length !== 1 ? 's' : ''} differ between this device
          and the database. Choose which version to keep for each one.
        </Text>
      </Box>
      <FlashList<RouteConflict>
        data={conflicts || []}
        keyExtractor={(conflict) => conflict.local.id}
        renderItem={renderItem}
        extraData={resolutions}
        estimatedItemSize={220}
      />
      <Box
        px={4}
        py={3}
        borderTopWidth={1}
        borderTopColor={theme.colors.muted[200]}
      >
        <Button
          onPress={onApply}
          borderRadius={8}
          _text={{ fontWeight: '700' }}
        >
          Apply & Save
        </Button>
      </Box>
    </VStack>
  );
}
