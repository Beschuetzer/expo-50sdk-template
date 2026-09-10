import { FontAwesome } from '@expo/vector-icons';
import { HStack, Text, VStack } from '@gluestack-ui/themed';
import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { FILE_NAMES } from '@/constants/general';
import { setError } from '@/state/slices/generalSlice';
import { tasksSelector } from '@/state/slices/tasksSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import {
  getDirectory,
  importAppData,
  makeNewDirectory,
  saveAppStateToFile,
  setAppData,
} from '@/utils/helpers';

type SaveLoadStateProps = object;

/**
 *Exports/imports a local JSON backup of the app's data to a user-chosen device directory (via
 *`expo-file-system` + `expo-document-picker`'s Storage Access Framework) - independent of the
 *backend, useful for local backups or moving data between devices manually.
 **/
export const SaveLoadState = (props: SaveLoadStateProps) => {
  const tasks = useAppSelector(tasksSelector);
  const dispatch = useAppDispatch();

  const onLoadPress = useCallback(async () => {
    try {
      const dir = await getDirectory();
      const data = await importAppData(dir);
      setAppData({ ...data, dispatch });
    } catch (error) {
      dispatch(
        setError({
          message: 'Unable to import app data.',
          error: {
            message: (error as Error)?.message,
            stack: (error as Error)?.stack,
            name: (error as Error)?.name,
          },
        }),
      );
    }
  }, [dispatch]);

  const onBackupPress = useCallback(async () => {
    try {
      const dir = await getDirectory();
      const newFolderName = new Date().toISOString();
      const madeDirectory = await makeNewDirectory(dir, newFolderName);
      await saveAppStateToFile(FILE_NAMES.tasks, madeDirectory, tasks);
    } catch (error) {
      dispatch(
        setError({
          message: 'Unable to save app data.',
          error: {
            message: (error as Error)?.message,
            stack: (error as Error)?.stack,
            name: (error as Error)?.name,
          },
        }),
      );
    }
  }, [tasks]);

  return (
    <VStack>
      <HStack justifyContent="space-between" alignItems="center">
        <Text>Local Backup (Restore/Backup):</Text>
        <TouchableOpacity onPress={onLoadPress}>
          <FontAwesome name="download" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onBackupPress}>
          <FontAwesome name="save" size={24} />
        </TouchableOpacity>
      </HStack>
    </VStack>
  );
};
