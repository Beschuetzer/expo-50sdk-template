import { FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
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
import { useMemo, useState } from 'react';
import { FlatList } from 'react-native';

import {
  addMutuallyExclusiveGroup,
  itemsListSelector,
  updateMutuallyExclusiveGroup,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { Item } from '@/types/Item';
import { MutuallyExclusiveGroup } from '@/types/listSlice';
import { getKeyToUse } from '@/utils/helpers';

export default function MutuallyExclusiveCreatorScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const allItems = useAppSelector(itemsListSelector);
  const allGroups = useAppSelector(
    (state: any) =>
      state.lists.mutuallyExclusiveGroups as MutuallyExclusiveGroup[],
  );

  const { groupId, selectedSide } = (route.params || {}) as {
    groupId?: string;
    selectedSide?: 'A' | 'B';
  };
  const existingGroup = groupId
    ? allGroups.find((g) => g.id === groupId) ?? null
    : null;

  const [filterText, setFilterText] = useState('');
  const [groupName, setGroupName] = useState(() => existingGroup?.name ?? '');
  const [sideAKeys, setSideAKeys] = useState<string[]>(
    () => existingGroup?.itemKeys1 ?? [],
  );
  const [sideBKeys, setSideBKeys] = useState<string[]>(
    () => existingGroup?.itemKeys2 ?? [],
  );
  const [activeSide, setActiveSide] = useState<'A' | 'B'>(selectedSide ?? 'A');
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    if (!existingGroup) return {};
    const q: Record<string, number> = {};
    existingGroup.itemKeys1.forEach((k, i) => {
      q[`A:${k}`] = existingGroup.quantities1[i] ?? 1;
    });
    existingGroup.itemKeys2.forEach((k, i) => {
      q[`B:${k}`] = existingGroup.quantities2[i] ?? 1;
    });
    return q;
  });
  // Tracks the raw typed string while an input is focused; keyed by qtyKey.
  const [rawInputValues, setRawInputValues] = useState<Record<string, string>>(
    {},
  );
  const canCreate = useMemo(() => {
    return (
      groupName.trim().length > 0 &&
      sideAKeys.length >= 1 &&
      sideBKeys.length >= 1
    );
  }, [groupName, sideAKeys, sideBKeys]);
  // Quantities are keyed by "A:itemKey" or "B:itemKey" so the same item
  // can carry an independent quantity on each side.
  const qtyKey = useMemo(
    () => (side: 'A' | 'B', key: string) => `${side}:${key}`,
    [],
  );

  const setQty = useMemo(
    () => (side: 'A' | 'B', key: string, raw: string) =>
      setQuantities((prev) => {
        const k = qtyKey(side, key);
        const num = parseInt(raw, 10);
        return { ...prev, [k]: isNaN(num) || num < 1 ? 1 : num };
      }),
    [qtyKey],
  );

  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return allItems.data;
    const lower = filterText.toLowerCase();
    return allItems.data.filter(
      (item) =>
        item.name?.toLowerCase().includes(lower) ||
        item.upc?.toLowerCase().includes(lower),
    );
  }, [allItems, filterText]);

  const toggleItem = (key: string) => {
    const inA = sideAKeys.includes(key);
    const inB = sideBKeys.includes(key);
    if (activeSide === 'A') {
      if (inA) {
        setSideAKeys((prev) => prev.filter((k) => k !== key));
      } else {
        setSideAKeys((prev) => [...prev, key]);
        setQuantities((prev) => ({
          ...prev,
          [qtyKey('A', key)]: prev[qtyKey('A', key)] ?? 1,
        }));
      }
    } else {
      if (inB) {
        setSideBKeys((prev) => prev.filter((k) => k !== key));
      } else {
        setSideBKeys((prev) => [...prev, key]);
        setQuantities((prev) => ({
          ...prev,
          [qtyKey('B', key)]: prev[qtyKey('B', key)] ?? 1,
        }));
      }
    }
  };

  const onCreatePress = () => {
    if (!canCreate) return;
    if (existingGroup) {
      dispatch(
        updateMutuallyExclusiveGroup({
          id: existingGroup.id,
          name: groupName.trim(),
          itemKeys1: sideAKeys,
          itemKeys2: sideBKeys,
          quantities1: sideAKeys.map((k) => quantities[qtyKey('A', k)] ?? 1),
          quantities2: sideBKeys.map((k) => quantities[qtyKey('B', k)] ?? 1),
        }),
      );
    } else {
      dispatch(
        addMutuallyExclusiveGroup({
          name: groupName.trim(),
          itemKeys1: sideAKeys,
          itemKeys2: sideBKeys,
          quantities1: sideAKeys.map((k) => quantities[qtyKey('A', k)] ?? 1),
          quantities2: sideBKeys.map((k) => quantities[qtyKey('B', k)] ?? 1),
        }),
      );
    }
    navigation.goBack();
  };

  function renderSideItems(keys: string[], side: 'A' | 'B') {
    if (keys.length === 0)
      return (
        <Text fontSize="xs" color={theme.colors.muted[400]}>
          None selected
        </Text>
      );
    return (
      <VStack space={1}>
        {keys.map((key) => {
          const item = allItems.data.find((it) => getKeyToUse(it) === key);
          return (
            <HStack
              key={key}
              alignItems="center"
              justifyContent="space-between"
              bg={
                side === 'A'
                  ? theme.colors.tertiary[100]
                  : theme.colors.primary[50]
              }
              borderRadius={4}
              px={2}
              py={1}
            >
              <Text
                fontSize="xs"
                color={theme.colors.tertiary[700]}
                flex={1}
                numberOfLines={1}
                mr={2}
              >
                {item?.name ?? key}
              </Text>
              <Input
                value={
                  qtyKey(side, key) in rawInputValues
                    ? rawInputValues[qtyKey(side, key)]
                    : String(quantities[qtyKey(side, key)] ?? 1)
                }
                onFocus={() =>
                  setRawInputValues((prev) => ({
                    ...prev,
                    [qtyKey(side, key)]: '',
                  }))
                }
                onChangeText={(v) => {
                  setRawInputValues((prev) => ({
                    ...prev,
                    [qtyKey(side, key)]: v,
                  }));
                  setQty(side, key, v);
                }}
                onBlur={() => {
                  const raw = rawInputValues[qtyKey(side, key)] ?? '';
                  const num = parseInt(raw, 10);
                  const final = isNaN(num) || num < 1 ? 1 : num;
                  setQty(side, key, String(final));
                  setRawInputValues((prev) => ({
                    ...prev,
                    [qtyKey(side, key)]: String(final),
                  }));
                }}
                keyboardType="numeric"
                w={16}
                h={8}
                textAlign="center"
                fontSize="xs"
              />
            </HStack>
          );
        })}
      </VStack>
    );
  }

  const renderItem = ({ item }: { item: Item }) => {
    const key = getKeyToUse(item);
    const inA = sideAKeys.includes(key);
    const inB = sideBKeys.includes(key);
    const isSelected = activeSide === 'A' ? inA : inB;
    const inBoth = inA && inB;

    return (
      <Pressable onPress={() => toggleItem(key)}>
        <HStack
          alignItems="center"
          px={4}
          py={3}
          space={3}
          bg={isSelected ? theme.colors.tertiary[50] : 'transparent'}
          borderBottomWidth={0.5}
          borderBottomColor={theme.colors.muted[200]}
        >
          <Box
            width={22}
            height={22}
            borderRadius={11}
            borderWidth={2}
            borderColor={
              inBoth
                ? theme.colors.amber[500]
                : inA
                  ? theme.colors.tertiary[600]
                  : inB
                    ? theme.colors.primary[500]
                    : theme.colors.muted[300]
            }
            alignItems="center"
            justifyContent="center"
            bg={
              inBoth
                ? theme.colors.amber[500]
                : inA
                  ? theme.colors.tertiary[600]
                  : inB
                    ? theme.colors.primary[500]
                    : 'transparent'
            }
          >
            {(inA || inB) && (
              <Text fontSize="2xs" color="white" fontWeight="bold">
                {inBoth ? 'A+B' : inA ? 'A' : 'B'}
              </Text>
            )}
          </Box>

          <VStack flex={1}>
            <Text fontWeight="500" numberOfLines={1}>
              {item.name || '(no name)'}
            </Text>
            {!!item.upc && (
              <Text fontSize="xs" color={theme.colors.muted[500]}>
                UPC: {item.upc}
              </Text>
            )}
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  return (
    <VStack flex={1}>
      {/* Group name */}
      <Box
        px={4}
        py={3}
        bg={theme.colors.muted[50]}
        borderBottomWidth={1}
        borderBottomColor={theme.colors.muted[200]}
      >
        <Input
          placeholder="Group name (e.g. Milk Type)"
          value={groupName}
          onChangeText={setGroupName}
          variant="outline"
        />
      </Box>

      {/* Side toggle */}
      <HStack
        px={4}
        pt={3}
        pb={2}
        space={2}
        bg={theme.colors.muted[50]}
        borderBottomWidth={1}
        borderBottomColor={theme.colors.muted[200]}
      >
        <Pressable flex={1} onPress={() => setActiveSide('A')}>
          <Box
            borderRadius={6}
            py={2}
            alignItems="center"
            bg={
              activeSide === 'A'
                ? theme.colors.tertiary[600]
                : theme.colors.muted[200]
            }
          >
            <Text
              fontSize="sm"
              fontWeight="700"
              color={activeSide === 'A' ? 'white' : theme.colors.muted[500]}
            >
              Side A ({sideAKeys.length})
            </Text>
          </Box>
        </Pressable>
        <Pressable flex={1} onPress={() => setActiveSide('B')}>
          <Box
            borderRadius={6}
            py={2}
            alignItems="center"
            bg={
              activeSide === 'B'
                ? theme.colors.primary[600]
                : theme.colors.muted[200]
            }
          >
            <Text
              fontSize="sm"
              fontWeight="700"
              color={activeSide === 'B' ? 'white' : theme.colors.muted[500]}
            >
              Side B ({sideBKeys.length})
            </Text>
          </Box>
        </Pressable>
      </HStack>

      {/* Selected items summary */}
      <Box px={4} py={3} bg={theme.colors.muted[50]}>
        <VStack space={2}>
          <VStack space={1}>
            <Text
              fontSize="xs"
              fontWeight="700"
              color={theme.colors.tertiary[700]}
            >
              Side A
            </Text>
            {renderSideItems(sideAKeys, 'A')}
          </VStack>
          <Text
            fontSize="xs"
            fontWeight="700"
            color={theme.colors.muted[500]}
            textAlign="center"
          >
            OR
          </Text>
          <VStack space={1}>
            <Text
              fontSize="xs"
              fontWeight="700"
              color={theme.colors.primary[700]}
            >
              Side B
            </Text>
            {renderSideItems(sideBKeys, 'B')}
          </VStack>
        </VStack>
      </Box>

      {/* Search */}
      <Box
        px={4}
        py={2}
        borderBottomWidth={1}
        borderBottomColor={theme.colors.muted[200]}
      >
        <Input
          placeholder="Search items…"
          value={filterText}
          onChangeText={setFilterText}
          variant="outline"
          InputLeftElement={
            <Box pl={3}>
              <FontAwesome
                name="search"
                size={14}
                color={theme.colors.muted[400]}
              />
            </Box>
          }
          InputRightElement={
            filterText.length > 0 ? (
              <Pressable onPress={() => setFilterText('')} pr={3}>
                <FontAwesome
                  name="times-circle"
                  size={16}
                  color={theme.colors.muted[400]}
                />
              </Pressable>
            ) : undefined
          }
        />
      </Box>

      {/* Items list */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => getKeyToUse(item)}
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
      />

      {/* Create button */}
      <Box
        px={4}
        py={3}
        borderTopWidth={1}
        borderTopColor={theme.colors.muted[200]}
      >
        <Button isDisabled={!canCreate} onPress={onCreatePress}>
          {existingGroup ? 'Update Pair' : 'Create Mutually Exclusive Pair'}
        </Button>
      </Box>
    </VStack>
  );
}
