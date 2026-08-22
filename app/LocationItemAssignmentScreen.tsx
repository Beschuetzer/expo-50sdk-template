import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import {
  Box,
  Button,
  HStack,
  Input,
  Pressable,
  Select,
  Text,
  useTheme,
  VStack,
} from 'native-base';
import { useLayoutEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import {
  itemsListSelector,
  itemsPurchasedAtStoreSelector,
  storeSpecificValuesMapSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { assignLocationToItems } from '@/state/thunks';
import {
  Item,
  StoreSpecificValueKey,
  StoreSpecificValuesMap,
} from '@/types/Item';
import { ensureMaxLength, getKeyToUse } from '@/utils/helpers';

type FilterOperator = 'equals' | 'matches' | 'notEquals';
type FilterJoinOperator = 'AND' | 'OR';

type FieldOption = {
  key: string;
  label: string;
  isStoreSpecific: boolean;
  /**
   *When `true`, the value for this field is always exactly 'true' or
   *'false'. The UI shows a True/False picker instead of a free-text value
   *input + operator picker for these fields, since typing arbitrary text
   *for a boolean (e.g. '1', 'True', 'yes') silently produced no matches.
   **/
  isBoolean?: boolean;
  getValue: (
    item: Item,
    storeSpecificValuesMap: StoreSpecificValuesMap,
    storeId: string,
    previouslyPurchasedAtStoreKeys: Set<string>,
  ) => string;
};

type FilterCondition = {
  id: string;
  fieldKey: string;
  operator: FilterOperator;
  value: string;
  /**
   *How this condition combines with the condition immediately before it in
   *the list. Ignored for the first condition. A run of consecutive 'AND'
   *conditions forms a group; an 'OR' starts a new group. Items match if
   *ANY group's conditions ALL match (i.e. groups are ORed, conditions
   *within a group are ANDed) - e.g. "A AND B OR C AND D" matches items
   *that satisfy (A AND B) OR (C AND D).
   **/
  joinOperator: FilterJoinOperator;
};

const OPERATOR_OPTIONS: { label: string; value: FilterOperator }[] = [
  { label: 'equals', value: 'equals' },
  { label: 'matches', value: 'matches' },
  { label: 'does not equal', value: 'notEquals' },
];

const getOperatorLabel = (operator: FilterOperator) =>
  OPERATOR_OPTIONS.find((option) => option.value === operator)?.label ??
  operator;

/**
 *Most conditions render as "{label} {operator} "{value}"" (or, for boolean
 *fields, "{label} is {value}"). `noLocationAssigned` reads oddly that way
 *("Does not have a location assigned is true"), so it gets its own phrasing
 *here instead.
 **/
const getConditionDisplayText = (
  fieldOption: FieldOption,
  condition: FilterCondition,
) => {
  if (fieldOption.key === 'noLocationAssigned') {
    return condition.value === 'true'
      ? 'Does not have a location assigned'
      : 'Has a location assigned';
  }
  if (fieldOption.isBoolean) {
    return `${fieldOption.label} is ${condition.value}`;
  }
  return `${fieldOption.label} ${getOperatorLabel(condition.operator)} "${condition.value}"`;
};

const getStoreSpecificValue = (
  item: Item,
  storeSpecificValuesMap: StoreSpecificValuesMap,
  storeId: string,
  fieldKey: StoreSpecificValueKey,
) => {
  const value = (storeSpecificValuesMap as any)?.[getKeyToUse(item)]?.[
    fieldKey
  ]?.[storeId];
  return value === undefined || value === null ? '' : String(value);
};

const buildFieldOptions = (
  storeName?: string,
  routeId?: string,
): FieldOption[] => [
  {
    key: 'name',
    label: 'Name',
    isStoreSpecific: false,
    getValue: (item) => item.name ?? '',
  },
  {
    key: 'upc',
    label: 'UPC',
    isStoreSpecific: false,
    getValue: (item) => item.upc ?? '',
  },
  {
    key: 'unit',
    label: 'Unit',
    isStoreSpecific: false,
    getValue: (item) => item.unit ?? '',
  },
  {
    key: 'isFrozen',
    label: 'Frozen',
    isStoreSpecific: false,
    isBoolean: true,
    getValue: (item) => (item.isFrozen ? 'true' : 'false'),
  },
  {
    key: 'url',
    label: 'URL',
    isStoreSpecific: false,
    getValue: (item) => item.url ?? '',
  },
  {
    key: 'previouslyPurchasedAtStore',
    label: storeName
      ? `Previously Purchased at ${storeName}`
      : 'Previously Purchased Here',
    isStoreSpecific: false,
    isBoolean: true,
    getValue: (item, _map, _storeId, previouslyPurchasedAtStoreKeys) =>
      previouslyPurchasedAtStoreKeys.has(getKeyToUse(item)) ? 'true' : 'false',
  },
  {
    key: StoreSpecificValueKey.Location,
    label: 'Location',
    isStoreSpecific: true,
    // Location is keyed by routeId (not storeId): the same item can be at a
    // different location depending on which route through the store is active.
    getValue: (item, map) =>
      getStoreSpecificValue(
        item,
        map,
        routeId || '',
        StoreSpecificValueKey.Location,
      ),
  },
  {
    key: 'noLocationAssigned',
    label: 'Does not have a location assigned',
    isStoreSpecific: true,
    isBoolean: true,
    // Kept separate from the free-text 'Location' field above so this can be
    // picked from the field dropdown as a simple True/False condition (e.g.
    // to re-add it after removing it) instead of requiring an empty value.
    getValue: (item, map) =>
      getStoreSpecificValue(
        item,
        map,
        routeId || '',
        StoreSpecificValueKey.Location,
      )
        ? 'false'
        : 'true',
  },
  {
    key: StoreSpecificValueKey.AisleNumber,
    label: 'Aisle Number',
    isStoreSpecific: true,
    getValue: (item, map, storeId) =>
      getStoreSpecificValue(
        item,
        map,
        storeId,
        StoreSpecificValueKey.AisleNumber,
      ),
  },
  {
    key: StoreSpecificValueKey.Note,
    label: 'Note',
    isStoreSpecific: true,
    getValue: (item, map, storeId) =>
      getStoreSpecificValue(item, map, storeId, StoreSpecificValueKey.Note),
  },
  {
    key: StoreSpecificValueKey.Price,
    label: 'Price',
    isStoreSpecific: true,
    getValue: (item, map, storeId) =>
      getStoreSpecificValue(item, map, storeId, StoreSpecificValueKey.Price),
  },
  {
    key: StoreSpecificValueKey.Quantity,
    label: 'Quantity',
    isStoreSpecific: true,
    getValue: (item, map, storeId) =>
      getStoreSpecificValue(item, map, storeId, StoreSpecificValueKey.Quantity),
  },
  {
    key: StoreSpecificValueKey.IsInCart,
    label: 'In Cart',
    isStoreSpecific: true,
    isBoolean: true,
    getValue: (item, map, storeId) => {
      // Items that have never had this store-specific value set return ''
      // from getStoreSpecificValue, which previously never matched 'true'
      // OR 'false', silently breaking boolean filtering for untouched
      // items. Normalize anything that isn't literally 'true' to 'false'.
      const rawValue = getStoreSpecificValue(
        item,
        map,
        storeId,
        StoreSpecificValueKey.IsInCart,
      );
      return rawValue === 'true' ? 'true' : 'false';
    },
  },
];

const getFieldOption = (fieldOptions: FieldOption[], fieldKey: string) =>
  fieldOptions.find((option) => option.key === fieldKey) ?? fieldOptions[0];

/**
 *Splits a flat, ordered list of conditions into groups by 'OR' joins. A run
 *of consecutive conditions joined by 'AND' (including the first condition
 *in the run) forms one group; hitting an 'OR' starts a new group.
 **/
const groupConditionsByOr = (
  conditions: FilterCondition[],
): FilterCondition[][] => {
  const groups: FilterCondition[][] = [];
  let currentGroup: FilterCondition[] = [];

  conditions.forEach((condition, index) => {
    if (index === 0 || condition.joinOperator === 'AND') {
      currentGroup.push(condition);
    } else {
      groups.push(currentGroup);
      currentGroup = [condition];
    }
  });

  if (currentGroup.length > 0) groups.push(currentGroup);
  return groups;
};

const evaluateCondition = (
  fieldOptions: FieldOption[],
  item: Item,
  condition: FilterCondition,
  storeSpecificValuesMap: StoreSpecificValuesMap,
  storeId: string,
  previouslyPurchasedAtStoreKeys: Set<string>,
) => {
  const fieldOption = getFieldOption(fieldOptions, condition.fieldKey);
  const actualValue = fieldOption
    .getValue(
      item,
      storeSpecificValuesMap,
      storeId,
      previouslyPurchasedAtStoreKeys,
    )
    .toLowerCase();
  const targetValue = condition.value.trim().toLowerCase();

  if (condition.operator === 'equals') return actualValue === targetValue;
  if (condition.operator === 'notEquals') return actualValue !== targetValue;
  return actualValue.includes(targetValue);
};

/**
 *Evaluates the full (possibly grouped) set of conditions against an item:
 *the item matches if ANY OR-separated group has ALL of its conditions
 *match (AND). An empty condition list always matches (no filters applied).
 **/
const evaluateConditions = (
  fieldOptions: FieldOption[],
  item: Item,
  conditions: FilterCondition[],
  storeSpecificValuesMap: StoreSpecificValuesMap,
  storeId: string,
  previouslyPurchasedAtStoreKeys: Set<string>,
) => {
  if (conditions.length === 0) return true;

  const groups = groupConditionsByOr(conditions);
  return groups.some((group) =>
    group.every((condition) =>
      evaluateCondition(
        fieldOptions,
        item,
        condition,
        storeSpecificValuesMap,
        storeId,
        previouslyPurchasedAtStoreKeys,
      ),
    ),
  );
};

export default function LocationItemAssignmentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const allItems = useAppSelector(itemsListSelector);
  const storeSpecificValuesMap = useAppSelector(storeSpecificValuesMapSelector);
  const previouslyPurchasedAtStore = useAppSelector(
    itemsPurchasedAtStoreSelector,
  );
  const previouslyPurchasedAtStoreKeys = useMemo(
    () => new Set(previouslyPurchasedAtStore.map((item) => getKeyToUse(item))),
    [previouslyPurchasedAtStore],
  );

  const { storeId, storeName, location, routeId } = (route.params || {}) as {
    storeId: string;
    storeName?: string;
    location: string;
    routeId: string;
  };

  const fieldOptions = useMemo(
    () => buildFieldOptions(storeName, routeId),
    [storeName, routeId],
  );

  const { height: windowHeight } = useWindowDimensions();
  // Caps just the (potentially long) active-conditions list so the overall
  // filters section can't grow to fill/exceed the screen. It's rendered as
  // the FlashList's header so it scrolls together with the item list rather
  // than being its own separate scroll area.
  const conditionsMaxHeight = windowHeight * 0.3;

  const getItemLocation = (key: string) =>
    (storeSpecificValuesMap as any)?.[key]?.[StoreSpecificValueKey.Location]?.[
      routeId
    ] || '';

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  // Default to hiding items already assigned to this location and to only
  // showing items previously purchased at the current store, since those
  // are almost always the items someone wants to assign on this screen.
  // The user can still remove/adjust these like any other condition.
  const [conditions, setConditions] = useState<FilterCondition[]>(() => [
    {
      id: 'default-previously-purchased-at-store',
      fieldKey: 'previouslyPurchasedAtStore',
      operator: 'equals',
      value: 'true',
      joinOperator: 'AND',
    },
    {
      id: 'default-no-location-assigned',
      fieldKey: 'noLocationAssigned',
      operator: 'equals',
      value: 'true',
      joinOperator: 'AND',
    },
  ]);
  const [draftFieldKey, setDraftFieldKey] = useState<string>(
    fieldOptions[0].key,
  );
  const [draftOperator, setDraftOperator] = useState<FilterOperator>('matches');
  const [draftValue, setDraftValue] = useState('');
  const [draftBooleanValue, setDraftBooleanValue] = useState<'true' | 'false'>(
    'true',
  );
  const [draftJoinOperator, setDraftJoinOperator] =
    useState<FilterJoinOperator>('AND');

  const draftFieldOption = getFieldOption(fieldOptions, draftFieldKey);

  const onDraftFieldKeyChange = (fieldKey: string) => {
    setDraftFieldKey(fieldKey);
    setDraftOperator('matches');
    setDraftValue('');
    setDraftBooleanValue('true');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Assign to '${ensureMaxLength(location, 18)}'`,
    });
  }, [navigation, location]);

  const addCondition = () => {
    const isBoolean = !!draftFieldOption.isBoolean;
    if (!isBoolean && !draftValue.trim()) return;

    setConditions((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fieldKey: draftFieldKey,
        operator: isBoolean ? 'equals' : draftOperator,
        value: isBoolean ? draftBooleanValue : draftValue.trim(),
        joinOperator: draftJoinOperator,
      },
    ]);
    setDraftValue('');
  };

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((condition) => condition.id !== id));
  };

  const filteredItems = useMemo(() => {
    return allItems.data
      .filter((item) =>
        evaluateConditions(
          fieldOptions,
          item,
          conditions,
          storeSpecificValuesMap,
          storeId,
          previouslyPurchasedAtStoreKeys,
        ),
      )
      .sort((firstItem, secondItem) =>
        (firstItem.name ?? '').localeCompare(secondItem.name ?? '', undefined, {
          sensitivity: 'base',
        }),
      );
  }, [
    allItems.data,
    storeSpecificValuesMap,
    conditions,
    storeId,
    previouslyPurchasedAtStoreKeys,
    fieldOptions,
  ]);

  const selectedItemNames = useMemo(
    () =>
      selectedKeys.map((key) => {
        const item = allItems.data.find((i) => getKeyToUse(i) === key);
        return item?.name ?? key;
      }),
    [selectedKeys, allItems.data],
  );

  const filteredItemKeys = useMemo(
    () => filteredItems.map((item) => getKeyToUse(item)),
    [filteredItems],
  );
  const areAllFilteredItemsSelected =
    filteredItemKeys.length > 0 &&
    filteredItemKeys.every((key) => selectedKeys.includes(key));

  const toggleSelectAllFiltered = () => {
    if (areAllFilteredItemsSelected) {
      setSelectedKeys((previousKeys) =>
        previousKeys.filter((key) => !filteredItemKeys.includes(key)),
      );
      return;
    }

    setSelectedKeys((previousKeys) => [
      ...new Set([...previousKeys, ...filteredItemKeys]),
    ]);
  };

  const toggleItem = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const onSave = () => {
    // Only items explicitly selected during this visit get assigned; any
    // item that already has this location but wasn't touched this visit is
    // left completely untouched (its assignment is never removed here).
    if (selectedKeys.length > 0) {
      dispatch(
        assignLocationToItems({
          storeId,
          routeId,
          location,
          itemKeysToAssign: selectedKeys,
          itemKeysToUnassign: [],
        }),
      );
    }

    navigation.goBack();
  };

  const renderItem = ({ item }: { item: Item }) => {
    const key = getKeyToUse(item);
    const isSelected = selectedKeys.includes(key);
    const itemLocation = getItemLocation(key);
    const isAlreadyAssignedHere = itemLocation === location;
    const isAssignedElsewhere = !!itemLocation && itemLocation !== location;

    return (
      <Pressable onPress={() => toggleItem(key)}>
        <HStack
          px={4}
          py={3}
          alignItems="center"
          space={3}
          borderBottomWidth={0.5}
          borderBottomColor={theme.colors.muted[200]}
        >
          <Box
            width={22}
            height={22}
            borderRadius={4}
            borderWidth={2}
            borderColor={
              isSelected ? theme.colors.primary[600] : theme.colors.muted[300]
            }
            bg={isSelected ? theme.colors.primary[600] : 'transparent'}
            alignItems="center"
            justifyContent="center"
          >
            {isSelected && <FontAwesome name="check" size={12} color="white" />}
          </Box>
          <VStack flex={1}>
            <Text
              fontWeight="500"
              fontSize="sm"
              color={theme.colors.dark[400]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {isAlreadyAssignedHere && (
              <Text fontSize="2xs" color={theme.colors.primary[600]}>
                Already assigned here
              </Text>
            )}
            {isAssignedElsewhere && (
              <Text fontSize="2xs" color={theme.colors.orange[500]}>
                Currently at: {itemLocation}
              </Text>
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
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => getKeyToUse(item)}
          renderItem={renderItem}
          extraData={selectedKeys}
          estimatedItemSize={47}
          ListHeaderComponent={
            <>
              {/* Filters */}
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
                  mb={1}
                >
                  {storeName ? `${storeName} — ` : ''}Assigning to &quot;
                  {location}
                  &quot;
                </Text>

                {/* Active conditions */}
                {conditions.length > 0 && (
                  <VStack space={1} mb={2}>
                    <HStack
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Text
                        fontSize="2xs"
                        color={theme.colors.muted[500]}
                        flex={1}
                      >
                        Items match if{' '}
                        <Text fontWeight="700" color={theme.colors.orange[600]}>
                          ANY
                        </Text>{' '}
                        group below matches (conditions inside a group must{' '}
                        <Text
                          fontWeight="700"
                          color={theme.colors.primary[700]}
                        >
                          ALL
                        </Text>{' '}
                        match)
                      </Text>
                      <Pressable
                        onPress={() => setConditions([])}
                        hitSlop={8}
                        px={2}
                        py={1}
                        _pressed={{ opacity: 0.5 }}
                      >
                        <HStack alignItems="center" space={1}>
                          <FontAwesome
                            name="times-circle"
                            size={12}
                            color={theme.colors.red[400]}
                          />
                          <Text
                            fontSize="2xs"
                            fontWeight="700"
                            color={theme.colors.red[500]}
                          >
                            Clear all
                          </Text>
                        </HStack>
                      </Pressable>
                    </HStack>
                    <ScrollView
                      style={{ maxHeight: conditionsMaxHeight }}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                    >
                      <VStack space={1}>
                        {groupConditionsByOr(conditions).map(
                          (group, groupIndex) => (
                            <VStack key={group[0].id}>
                              {groupIndex > 0 && (
                                <HStack alignItems="center" my={1} space={2}>
                                  <Box
                                    flex={1}
                                    h={0.5}
                                    bg={theme.colors.orange[300]}
                                  />
                                  <Box
                                    bg={theme.colors.orange[500]}
                                    borderRadius={4}
                                    px={2}
                                    py={0.5}
                                  >
                                    <Text
                                      fontSize="2xs"
                                      fontWeight="800"
                                      color="white"
                                    >
                                      OR
                                    </Text>
                                  </Box>
                                  <Box
                                    flex={1}
                                    h={0.5}
                                    bg={theme.colors.orange[300]}
                                  />
                                </HStack>
                              )}
                              <VStack
                                space={1}
                                bg={theme.colors.primary[50]}
                                borderWidth={1.5}
                                borderColor={theme.colors.primary[200]}
                                borderRadius={8}
                                p={2}
                              >
                                {group.map((condition, conditionIndex) => {
                                  const fieldOption = getFieldOption(
                                    fieldOptions,
                                    condition.fieldKey,
                                  );
                                  return (
                                    <VStack key={condition.id}>
                                      {conditionIndex > 0 && (
                                        <Box alignSelf="center" py={0.5}>
                                          <Box
                                            bg={theme.colors.primary[200]}
                                            borderRadius={4}
                                            px={1.5}
                                            py={0.5}
                                          >
                                            <Text
                                              fontSize="2xs"
                                              fontWeight="800"
                                              color={theme.colors.primary[800]}
                                            >
                                              AND
                                            </Text>
                                          </Box>
                                        </Box>
                                      )}
                                      <HStack
                                        alignItems="center"
                                        justifyContent="space-between"
                                        bg="white"
                                        borderWidth={1}
                                        borderColor={theme.colors.muted[200]}
                                        borderRadius={6}
                                        px={3}
                                        py={1.5}
                                      >
                                        <Text
                                          fontSize="xs"
                                          fontWeight="600"
                                          color={theme.colors.primary[700]}
                                          flex={1}
                                        >
                                          {getConditionDisplayText(
                                            fieldOption,
                                            condition,
                                          )}
                                        </Text>
                                        <Pressable
                                          onPress={() =>
                                            removeCondition(condition.id)
                                          }
                                          hitSlop={8}
                                          p={1}
                                        >
                                          <FontAwesome
                                            name="times"
                                            size={14}
                                            color={theme.colors.red[400]}
                                          />
                                        </Pressable>
                                      </HStack>
                                    </VStack>
                                  );
                                })}
                              </VStack>
                            </VStack>
                          ),
                        )}
                      </VStack>
                    </ScrollView>
                  </VStack>
                )}

                {/* Add condition row */}
                <Text
                  fontSize="2xs"
                  fontWeight="700"
                  color={theme.colors.muted[500]}
                  mb={1}
                >
                  Add filter condition
                </Text>
                {conditions.length > 0 && (
                  <HStack space={2} alignItems="center" mb={2}>
                    <Text fontSize="2xs" color={theme.colors.muted[500]}>
                      Combine with previous using:
                    </Text>
                    {(['AND', 'OR'] as FilterJoinOperator[]).map(
                      (joinOperator) => (
                        <Pressable
                          key={joinOperator}
                          onPress={() => setDraftJoinOperator(joinOperator)}
                          borderWidth={1.5}
                          borderColor={
                            draftJoinOperator === joinOperator
                              ? theme.colors.primary[600]
                              : theme.colors.muted[300]
                          }
                          bg={
                            draftJoinOperator === joinOperator
                              ? theme.colors.primary[50]
                              : 'transparent'
                          }
                          borderRadius={6}
                          px={2}
                          py={0.5}
                        >
                          <Text
                            fontSize="2xs"
                            fontWeight="700"
                            color={
                              draftJoinOperator === joinOperator
                                ? theme.colors.primary[700]
                                : theme.colors.muted[600]
                            }
                          >
                            {joinOperator}
                          </Text>
                        </Pressable>
                      ),
                    )}
                  </HStack>
                )}
                <HStack space={2} alignItems="center" mb={2}>
                  <Select
                    selectedValue={draftFieldKey}
                    onValueChange={onDraftFieldKeyChange}
                    flex={draftFieldOption.isBoolean ? 1 : 2}
                    h={9}
                  >
                    {fieldOptions.map((option) => (
                      <Select.Item
                        key={option.key}
                        label={option.label}
                        value={option.key}
                      />
                    ))}
                  </Select>
                  {!draftFieldOption.isBoolean && (
                    <Select
                      selectedValue={draftOperator}
                      onValueChange={(val) =>
                        setDraftOperator(val as FilterOperator)
                      }
                      flex={1}
                      h={9}
                    >
                      {OPERATOR_OPTIONS.map((option) => (
                        <Select.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Select>
                  )}
                  {draftFieldOption.isBoolean && (
                    <Select
                      selectedValue={draftBooleanValue}
                      onValueChange={(val) =>
                        setDraftBooleanValue(val as 'true' | 'false')
                      }
                      flex={1}
                      h={9}
                    >
                      <Select.Item label="True" value="true" />
                      <Select.Item label="False" value="false" />
                    </Select>
                  )}
                </HStack>
                {!draftFieldOption.isBoolean && (
                  <HStack space={2} alignItems="center">
                    <Input
                      flex={1}
                      value={draftValue}
                      onChangeText={setDraftValue}
                      placeholder="Value"
                      variant="outline"
                      h={9}
                    />
                    <Pressable
                      onPress={addCondition}
                      bg={theme.colors.primary[600]}
                      borderRadius={6}
                      px={3}
                      h={9}
                      alignItems="center"
                      justifyContent="center"
                      opacity={draftValue.trim() ? 1 : 0.4}
                    >
                      <Text color="white" fontWeight="700" fontSize="sm">
                        Add
                      </Text>
                    </Pressable>
                  </HStack>
                )}
                {draftFieldOption.isBoolean && (
                  <Pressable
                    onPress={addCondition}
                    bg={theme.colors.primary[600]}
                    borderRadius={6}
                    px={3}
                    h={9}
                    alignItems="center"
                    justifyContent="center"
                    alignSelf="flex-start"
                  >
                    <Text color="white" fontWeight="700" fontSize="sm">
                      Add
                    </Text>
                  </Pressable>
                )}
              </Box>

              {/* Selected items summary */}
              <Box
                px={4}
                py={2}
                borderBottomWidth={1}
                borderBottomColor={theme.colors.muted[200]}
              >
                <HStack alignItems="center" justifyContent="space-between">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color={theme.colors.muted[500]}
                  >
                    Selected ({selectedKeys.length}/{filteredItems.length})
                  </Text>
                  <Pressable
                    onPress={toggleSelectAllFiltered}
                    disabled={filteredItemKeys.length === 0}
                    px={2}
                    py={1}
                    borderRadius={6}
                    bg={
                      filteredItemKeys.length === 0
                        ? theme.colors.muted[100]
                        : theme.colors.primary[50]
                    }
                    _pressed={{ opacity: 0.6 }}
                    opacity={filteredItemKeys.length === 0 ? 0.5 : 1}
                  >
                    <Text
                      fontSize="2xs"
                      fontWeight="700"
                      color={
                        filteredItemKeys.length === 0
                          ? theme.colors.muted[500]
                          : theme.colors.primary[700]
                      }
                    >
                      {areAllFilteredItemsSelected
                        ? 'Clear filtered'
                        : 'Select all filtered'}
                    </Text>
                  </Pressable>
                </HStack>
                <Text
                  fontSize="xs"
                  color={theme.colors.muted[600]}
                  numberOfLines={2}
                >
                  {selectedItemNames.length > 0
                    ? selectedItemNames.join(', ')
                    : 'No items selected yet.'}
                </Text>
              </Box>
            </>
          }
          ListEmptyComponent={
            <Box px={4} py={6} alignItems="center">
              <Text color={theme.colors.muted[400]} fontSize="sm">
                No items match the current filters.
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
          <Button onPress={onSave}>Save Assignments</Button>
        </Box>
      </VStack>
    </KeyboardAvoidingView>
  );
}
