import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import {
  Box,
  HStack,
  Pressable,
  Row,
  Text,
  theme as nbTheme,
  useTheme,
  VStack,
} from 'native-base';
import { useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  Menu,
  MenuOption,
  MenuOptionCustomStyle,
  MenuOptions,
  MenuOptionsCustomStyle,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';

import { ItemTileViewingMode } from './ItemTile';
import { ImageRenderer } from '../ImageRenderer';

import { Routes } from '@/constants/navigation';
import {
  acceptMutuallyExclusiveGroupSide,
  itemsListSelector,
  removeItemFromMutuallyExclusiveGroup,
  removeMutuallyExclusiveGroup,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { Item, ItemWithStoreSpecificValues } from '@/types/Item';
import { ListName, MutuallyExclusiveGroup } from '@/types/listSlice';
import { getButtonHitSlop, getItemFromList } from '@/utils/helpers';

type MutuallyExclusiveTileProps = {
  group: MutuallyExclusiveGroup;
  items1: (ItemWithStoreSpecificValues | undefined)[];
  items2: (ItemWithStoreSpecificValues | undefined)[];
  listName: ListName;
  viewingMode?: ItemTileViewingMode;
};

export function MutuallyExclusiveTile(props: MutuallyExclusiveTileProps) {
  const { group, items1, items2 } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const itemsList = useAppSelector(itemsListSelector);

  const { SlideInMenu } = renderers;

  function getDisplayLabel(
    base: ItemWithStoreSpecificValues | Item | null,
    key: string,
  ) {
    if (!base) return key;
    return base.name && base.upc
      ? `${base.name} (${base.upc})`
      : base.name ?? base.upc ?? key;
  }

  const summary1 = group.itemKeys1
    .map((k, i) => {
      const base = items1[i] ?? getItemFromList(itemsList.data, k) ?? null;
      return getDisplayLabel(base, k);
    })
    .join(', ');

  const summary2 = group.itemKeys2
    .map((k, i) => {
      const base = items2[i] ?? getItemFromList(itemsList.data, k) ?? null;
      return getDisplayLabel(base, k);
    })
    .join(', ');

  const editMutuallyExclusiveGroup = useCallback(
    (selectedSide?: 'A' | 'B') => {
      // @ts-ignore
      navigation.navigate(Routes.MutuallyExclusiveCreatorScreen, {
        groupId: group.id,
        selectedSide,
      });
    },
    [navigation, group.id],
  );

  function renderSideItems(
    keys: string[],
    items: (ItemWithStoreSpecificValues | undefined)[],
    groupQtys: number[],
    side: 1 | 2,
  ) {
    return keys.map((k, i) => {
      const item = items[i];
      const qty = groupQtys[i] ?? 1;

      const buttonJsx = (
        <TouchableOpacity
          hitSlop={getButtonHitSlop(2)}
          style={{ alignSelf: 'center' }}
          onPress={() =>
            dispatch(
              removeItemFromMutuallyExclusiveGroup({
                groupId: group.id,
                side,
                itemKey: k,
              }),
            )
          }
        >
          <FontAwesome
            name="times"
            size={theme.sizes[4]}
            color={theme.colors.red[400]}
          />
        </TouchableOpacity>
      );

      const quantityButton = (
        <TouchableOpacity
          onPress={() => editMutuallyExclusiveGroup(side === 1 ? 'A' : 'B')}
          hitSlop={getButtonHitSlop(2)}
        >
          <Text
            fontSize="xs"
            color={theme.colors.white[400]}
            alignSelf="center"
          >
            qty: {qty}
          </Text>
        </TouchableOpacity>
      );

      const base = getItemFromList(itemsList.data, k);
      if (!item && !base) {
        return (
          <Text
            key={k}
            px={3}
            py={2}
            fontSize="xs"
            color={theme.colors.error[500]}
          >
            Item data unavailable
          </Text>
        );
      }

      const itemToUse = item || base || undefined;
      return (
        <TouchableOpacity
          key={k}
          onPress={() =>
            // @ts-ignore
            navigation.navigate(Routes.ItemModal, {
              key: itemToUse,
              showOverrideMsg: false,
            })
          }
        >
          <HStack
            px={3}
            py={2}
            alignItems="flex-start"
            justifyContent="center"
            borderBottomWidth={0.5}
            borderBottomColor={theme.colors.muted[100]}
            space={3}
          >
            <ImageRenderer item={itemToUse} width={44} height={54} />
            <VStack flex={1} space={0.5}>
              <Text
                fontSize="xs"
                fontWeight="600"
                color={theme.colors.tertiary[800]}
                numberOfLines={2}
              >
                {itemToUse?.name ?? k}
              </Text>
              {!!itemToUse?.upc && (
                <Text fontSize="2xs" color={theme.colors.white[500]}>
                  {itemToUse?.upc}
                </Text>
              )}
            </VStack>
            <HStack flex={0} space={4} alignItems="center" height="100%" mr={2}>
              {quantityButton}
              {buttonJsx}
            </HStack>
          </HStack>
        </TouchableOpacity>
      );
    });
  }

  return (
    <Box
      borderWidth={1}
      borderColor={theme.colors.tertiary[300]}
      borderRadius={8}
      overflow="hidden"
      m={theme.space[0.5]}
    >
      {/* Header — left side toggles expand, right side holds the menu */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        px={3}
        py={2}
        bg={theme.colors.tertiary[50]}
      >
        <Pressable
          flex={1}
          flexShrink={1}
          onPress={() => setIsExpanded((v) => !v)}
        >
          <HStack alignItems="center" space={2} flexShrink={1}>
            <FontAwesome
              name="random"
              size={14}
              color={theme.colors.tertiary[600]}
            />
            <Text
              fontSize="xs"
              color={theme.colors.tertiary[700]}
              fontWeight="600"
              numberOfLines={1}
              flexShrink={1}
            >
              {group.name || `${summary1} OR ${summary2}`}
            </Text>
          </HStack>
        </Pressable>

        <HStack alignItems="center" space={3} ml={2}>
          <FontAwesome
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={theme.colors.tertiary[500]}
          />
          <Menu renderer={SlideInMenu}>
            <MenuTrigger
              customStyles={{
                triggerWrapper: { padding: 12 },
              }}
            >
              <FontAwesome
                name="ellipsis-v"
                size={18}
                color={theme.colors.tertiary[500]}
              />
            </MenuTrigger>
            <MenuOptions customStyles={menuOptionsStyle}>
              <MenuOption
                customStyles={menuOptionStyle}
                onSelect={editMutuallyExclusiveGroup}
                text="Edit Group"
              />
              <MenuOption
                customStyles={menuOptionStyle}
                onSelect={() =>
                  dispatch(
                    acceptMutuallyExclusiveGroupSide({
                      id: group.id,
                      acceptedSide: 1,
                    }),
                  )
                }
                text="Accept Side A"
              />
              <MenuOption
                customStyles={menuOptionStyle}
                onSelect={() =>
                  dispatch(
                    acceptMutuallyExclusiveGroupSide({
                      id: group.id,
                      acceptedSide: 2,
                    }),
                  )
                }
                text="Accept Side B"
              />
              <MenuOption
                customStyles={menuOptionStyle}
                onSelect={() =>
                  dispatch(
                    removeMutuallyExclusiveGroup({
                      id: group.id,
                      keepItems: true,
                    }),
                  )
                }
                text="Remove Group"
              />
              <MenuOption
                customStyles={menuOptionStyle}
                onSelect={() =>
                  dispatch(removeMutuallyExclusiveGroup({ id: group.id }))
                }
                text="Remove Group and Items"
              />
            </MenuOptions>
          </Menu>
        </HStack>
      </HStack>

      {/* Expanded body */}
      {isExpanded && (
        <VStack>
          {renderSideItems(
            group.itemKeys1,
            items1,
            group.quantities1 ?? group.itemKeys1.map(() => 1),
            1,
          )}

          <Row alignItems="center" px={3} py={1}>
            <Box flex={1} height={0.5} bg={theme.colors.tertiary[200]} />
            <Text
              mx={2}
              fontSize="xs"
              fontWeight="700"
              color={theme.colors.tertiary[500]}
            >
              OR
            </Text>
            <Box flex={1} height={0.5} bg={theme.colors.tertiary[200]} />
          </Row>

          {renderSideItems(
            group.itemKeys2,
            items2,
            group.quantities2 ?? group.itemKeys2.map(() => 1),
            2,
          )}
        </VStack>
      )}
    </Box>
  );
}

const menuOptionStyle: MenuOptionCustomStyle = {
  optionText: {
    color: nbTheme.colors.white,
    fontWeight: '300',
    fontSize: 20,
    paddingVertical: nbTheme.sizes[1],
    textAlign: 'center',
  },
};

const menuOptionsStyle: MenuOptionsCustomStyle = {
  optionsContainer: { backgroundColor: nbTheme.colors.black },
};
