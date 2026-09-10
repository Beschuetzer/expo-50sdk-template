import { FontAwesome } from '@expo/vector-icons';
import { HStack, Text, VStack } from '@gluestack-ui/themed';
import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import {
  accountSelector,
  isUpToDateSelector,
} from '@/state/slices/generalSlice';
import { tasksSelector } from '@/state/slices/tasksSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { loadAll, saveAll } from '@/state/thunks';

type SaveLoadStateViaDbProps = object;

/**
 *Syncs local state with the backend via the `saveAll`/`loadAll` thunks (see `state/thunks.ts`).
 **/
export const SaveLoadStateFromDb = (props: SaveLoadStateViaDbProps) => {
  const tasks = useAppSelector(tasksSelector);
  const userAccount = useAppSelector(accountSelector);
  const isUpToDate = useAppSelector(isUpToDateSelector);
  const dispatch = useAppDispatch();

  const onLoadPress = useCallback(async () => {
    dispatch(loadAll());
  }, [dispatch]);

  const onBackupPress = useCallback(async () => {
    dispatch(saveAll({ tasks }));
  }, [tasks, dispatch]);

  if (!userAccount || !userAccount._id) return null;
  return (
    <VStack>
      <HStack justifyContent="space-between" alignItems="center">
        <Text>Cloud Data (Restore/Backup):</Text>
        <TouchableOpacity onPress={onLoadPress}>
          <FontAwesome name="download" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onBackupPress}>
          <FontAwesome name="save" size={24} />
        </TouchableOpacity>
      </HStack>
      <HStack space="sm" justifyContent="flex-start" alignItems="center">
        {isUpToDate ? (
          <>
            <FontAwesome name="check" color="#166534" />
            <Text color="$green900">in sync</Text>
          </>
        ) : (
          <>
            <FontAwesome name="close" color="#991b1b" />
            <Text color="$red900">sync needed</Text>
          </>
        )}
      </HStack>
    </VStack>
  );
};
