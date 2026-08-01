import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import {
  Box,
  HStack,
  Input,
  Pressable,
  Text,
  useTheme,
  VStack,
} from 'native-base';
import { useMemo, useState } from 'react';

import { ModalWithBlur } from './ModalWithBlur';

import { addReturnItem, itemsListSelector } from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { Item } from '@/types/Item';
import { getKeyToUse } from '@/utils/helpers';
import { ImageRenderer } from '../ImageRenderer';
import { TouchableOpacity } from 'react-native-gesture-handler';

type ReturnItemModalProps = {
  isVisible: boolean;
  storeId: string;
  onClose: () => void;
};

export function ReturnItemModal({
  isVisible,
  storeId,
  onClose,
}: ReturnItemModalProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const itemsList = useAppSelector(itemsListSelector);
  const [filterText, setFilterText] = useState('');

  const filteredItems = useMemo(() => {
    const lower = filterText.trim().toLowerCase();
    if (!lower) return itemsList.data;
    return itemsList.data.filter(
      (item) =>
        item.name?.toLowerCase().includes(lower) ||
        item.upc?.toLowerCase().includes(lower),
    );
  }, [itemsList.data, filterText]);

  const onSelectItem = (item: Item) => {
    dispatch(addReturnItem({ storeId, itemKey: getKeyToUse(item) }));
    onClose();
  };

  const renderItem = ({ item }: { item: Item }) => (
    <Pressable onPress={() => onSelectItem(item)}>
      <HStack
        px={4}
        py={3}
        space={3}
        alignItems="flex-start"
        borderBottomWidth={0.5}
        borderBottomColor={theme.colors.muted[200]}
      >
        <ImageRenderer item={item} height={45} />
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
        <FontAwesome name="reply" size={16} color={theme.colors.orange[500]} />
      </HStack>
    </Pressable>
  );

  return (
    <ModalWithBlur
      isVisible={isVisible}
      title="Select Return Item"
      onCancel={onClose}
      cancelButton={{
        text: 'Close',
        colorScheme: 'muted',
        isVisible: true,
        isEnabled: true,
      }}
      containerStyles={{
        width: '90%',
        height: '90%',
        maxHeight: '100',
      }}
      confirmButton={{ isVisible: false, isEnabled: false, text: '' }}
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
      <FlashList
        data={filteredItems}
        keyExtractor={(item) => getKeyToUse(item)}
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
        estimatedItemSize={69}
      />
    </ModalWithBlur>
  );
}
