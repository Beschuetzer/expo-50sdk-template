import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Badge, HStack, Text, useTheme, VStack } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ImageRenderer } from '../ImageRenderer';

import { Routes } from '@/constants/navigation';
import { removeReturnItem } from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { Item } from '@/types/Item';
import { getButtonHitSlop, getItemFromList } from '@/utils/helpers';

type ReturnItemTileProps = {
  itemKey: string;
  storeId: string;
};

export function ReturnItemTile({ itemKey, storeId }: ReturnItemTileProps) {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const allItems = useAppSelector(
    (state: any) => state.lists.itemsList.data as Item[],
  );

  const item = getItemFromList(allItems, itemKey);

  const onRemove = () => {
    dispatch(removeReturnItem({ storeId, itemKey }));
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (!item) return;
        // @ts-ignore
        navigation.navigate(Routes.ItemModal, {
          key: item,
          showOverrideMsg: false,
        });
      }}
    >
      <HStack
        px={3}
        py={2}
        space={3}
        bg={theme.colors.orange[50]}
        borderLeftWidth={4}
        borderLeftColor={theme.colors.orange[500]}
        borderBottomWidth={0.5}
        borderBottomColor={theme.colors.orange[200]}
      >
        <ImageRenderer item={item ?? undefined} width={44} height={54} />
        <VStack flex={1} space={0.5}>
          <HStack alignItems="center" space={2}>
            <Badge
              colorScheme="orange"
              variant="solid"
              _text={{ fontSize: '2xs', fontWeight: 'bold' }}
              px={1.5}
              py={0}
              borderRadius={4}
            >
              RETURN
            </Badge>
          </HStack>
          <Text
            fontSize="xs"
            fontWeight="600"
            color={theme.colors.orange[900]}
            numberOfLines={2}
          >
            {item?.name ?? itemKey}
          </Text>
          {!!item?.upc && (
            <Text fontSize="2xs" color={theme.colors.orange[600]}>
              {item.upc}
            </Text>
          )}
        </VStack>

        <TouchableOpacity
          hitSlop={getButtonHitSlop(2)}
          style={{ alignSelf: 'center' }}
          onPress={onRemove}
        >
          <FontAwesome
            name="times"
            size={20}
            color={theme.colors.orange[500]}
          />
        </TouchableOpacity>
      </HStack>
    </TouchableOpacity>
  );
}
