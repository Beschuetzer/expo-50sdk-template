import { Box, HStack, Text, useTheme, VStack } from 'native-base';
import { FlatList } from 'react-native';

import { ModalWithBlur } from './ModalWithBlur';
import { ImageRenderer } from '../ImageRenderer';

import {
  itemsListSelector,
  returnItemsSelector,
} from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import { getItemFromList } from '@/utils/helpers';

type StoreReturnItemsModalProps = {
  isVisible: boolean;
  storeId: string;
  onClose: () => void;
};

export function StoreReturnItemsModal({
  isVisible,
  storeId,
  onClose,
}: StoreReturnItemsModalProps) {
  const theme = useTheme();
  const itemsList = useAppSelector(itemsListSelector);
  const returnItemsMap = useAppSelector(returnItemsSelector);
  const returnKeys = returnItemsMap[storeId] ?? [];

  return (
    <ModalWithBlur
      isVisible={isVisible}
      title="Return Items"
      onCancel={onClose}
      cancelButton={{
        text: 'Close',
        colorScheme: 'muted',
        isVisible: true,
        isEnabled: true,
      }}
      containerStyles={{
        width: '90%',
        maxWidth: '400px',
      }}
      confirmButton={{ isVisible: false, isEnabled: false, text: '' }}
    >
      <FlatList
        data={returnKeys}
        keyExtractor={(k) => k}
        ListEmptyComponent={
          <Box px={4} py={4} alignItems="center">
            <Text color={theme.colors.muted[400]} fontSize="sm">
              No return items for this store.
            </Text>
          </Box>
        }
        renderItem={({ item: key }) => {
          const item = getItemFromList(itemsList.data, key);
          return (
            <HStack
              px={4}
              py={2}
              alignItems="center"
              space={3}
              borderBottomWidth={0.5}
              borderBottomColor={theme.colors.muted[200]}
              bg={theme.colors.orange[50]}
              borderLeftWidth={4}
              borderLeftColor={theme.colors.orange[500]}
            >
              <ImageRenderer item={item ?? undefined} />
              <VStack flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color={theme.colors.orange[900]}
                  numberOfLines={1}
                >
                  {item?.name ?? key}
                </Text>
                {!!item?.upc && (
                  <Text fontSize="xs" color={theme.colors.orange[600]}>
                    {item.upc}
                  </Text>
                )}
              </VStack>
            </HStack>
          );
        }}
      />
    </ModalWithBlur>
  );
}
