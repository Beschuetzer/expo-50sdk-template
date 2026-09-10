import { Heading, VStack } from '@gluestack-ui/themed';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { TaskTile } from '../../tiles/TaskTile';
import { BFF_SERVICE } from '../BffService';

import { accountSelector, loadingSelector } from '@/state/slices/generalSlice';
import { useAppSelector } from '@/state/store';
import { Task } from '@/types/Task';
import { ListRow } from '@/types/general';
import { getUserCredentials, handleError } from '@/utils/helpers';

type UserTasksProps = object;

export const UserTasks = (props: UserTasksProps) => {
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const account = useAppSelector(accountSelector);
  const loading = useAppSelector(loadingSelector);

  useEffect(() => {
    (async () => {
      try {
        if (!loading) return;
        const response = await BFF_SERVICE.getUserTasks({
          userId: getUserCredentials(account).userId,
          dispatch,
        });
        if (!Array.isArray(response)) return;
        setTasks(response);
      } catch (error) {
        handleError(dispatch, error as Error, 'Unable to get user tasks.');
      }
    })();
  }, [loading]);

  function renderTasks(toRender: ListRow<Task>) {
    const { item } = toRender;
    return <TaskTile item={item} />;
  }

  return (
    <VStack>
      <Heading size="md">Tasks:</Heading>
      <FlashList
        keyboardShouldPersistTaps="always"
        data={tasks}
        renderItem={renderTasks}
        estimatedItemSize={108}
      />
    </VStack>
  );
};
