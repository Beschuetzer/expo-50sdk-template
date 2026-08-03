import { useNavigation } from 'expo-router';
import { Box, HStack, Text, useTheme, VStack } from 'native-base';
import { FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { ModalWithBlur } from './ModalWithBlur';

import { Routes } from '@/constants/navigation';
import {
  itemsListSelector,
  mutuallyExclusiveGroupsSelector,
} from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import { MutuallyExclusiveGroup } from '@/types/listSlice';
import { getItemFromList } from '@/utils/helpers';

type StoreMutuallyExclusiveGroupsModalProps = {
  isVisible: boolean;
  storeId: string;
  onClose: () => void;
};

export function StoreMutuallyExclusiveGroupsModal({
  isVisible,
  storeId,
  onClose,
}: StoreMutuallyExclusiveGroupsModalProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const itemsList = useAppSelector(itemsListSelector);
  const allGroups = useAppSelector(mutuallyExclusiveGroupsSelector);
  const storeGroups = allGroups.filter((g) => g.storeId === storeId);

  const formatSide = (keys: string[], qtys: number[]) =>
    keys
      .map((k, i) => {
        const item = getItemFromList(itemsList.data, k);
        const name = item?.name ?? k;
        const qty = qtys[i] ?? 1;
        return qty === 1 ? name : `${qty} of ${name}`;
      })
      .join(' and ');

  const onEditGroup = (group: MutuallyExclusiveGroup) => {
    onClose();
    // @ts-ignore
    navigation.navigate(Routes.MutuallyExclusiveCreatorScreen, {
      groupId: group.id,
    });
  };

  return (
    <ModalWithBlur
      isVisible={isVisible}
      title="Mutually Exclusive Groups"
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
        data={storeGroups}
        keyExtractor={(g) => g.id}
        ListEmptyComponent={
          <Box px={4} py={4} alignItems="center">
            <Text color={theme.colors.muted[400]} fontSize="sm">
              No mutually exclusive groups for this store.
            </Text>
          </Box>
        }
        renderItem={({ item: group }) => {
          const side1 = formatSide(
            group.itemKeys1,
            group.quantities1 ?? group.itemKeys1.map(() => 1),
          );
          const side2 = formatSide(
            group.itemKeys2,
            group.quantities2 ?? group.itemKeys2.map(() => 1),
          );
          return (
            <TouchableOpacity onPress={() => onEditGroup(group)}>
              <HStack
                px={4}
                py={3}
                alignItems="center"
                space={3}
                borderBottomWidth={0.5}
                borderBottomColor={theme.colors.muted[200]}
              >
                <VStack flex={1}>
                  {!!group.name && (
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color={theme.colors.primary[700]}
                    >
                      {group.name}
                    </Text>
                  )}
                  <Text
                    fontSize="sm"
                    color={theme.colors.gray[700]}
                    fontWeight={300}
                  >
                    Buy {side1} OR {side2}
                  </Text>
                </VStack>
              </HStack>
            </TouchableOpacity>
          );
        }}
      />
    </ModalWithBlur>
  );
}
