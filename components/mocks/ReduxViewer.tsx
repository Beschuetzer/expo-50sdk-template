import {
  Button,
  ButtonText,
  Heading,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';

import { getRandomInt, getRandomTask } from './helpers';

import { setTasks, tasksSelector } from '@/state/slices/tasksSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';

const NUMBER_OF_TASKS_TO_MOCK = 25;

/**
 *A small dev-only tool (see `DevOptionsScreen`) for seeding/clearing redux state with mock data,
 *useful when manually testing list rendering/performance without a real backend.
 **/
export function ReduxViewer() {
  const tasks = useAppSelector(tasksSelector);
  const dispatch = useAppDispatch();

  function onSeedTasksPress() {
    const newTasks = Array.from(
      { length: NUMBER_OF_TASKS_TO_MOCK },
      (_, index) =>
        getRandomTask(`Mock Task ${index + 1} (${getRandomInt(0, 999999)})`),
    );
    dispatch(setTasks([...tasks, ...newTasks]));
  }

  function onClearTasksPress() {
    dispatch(setTasks([]));
  }

  return (
    <VStack space="sm">
      <Heading size="sm">Redux Dev Tools</Heading>
      <Text>{tasks.length} task(s) currently in state.</Text>
      <Button onPress={onSeedTasksPress}>
        <ButtonText>Seed {NUMBER_OF_TASKS_TO_MOCK} Mock Tasks</ButtonText>
      </Button>
      <Button variant="outline" onPress={onClearTasksPress}>
        <ButtonText>Clear All Tasks</ButtonText>
      </Button>
    </VStack>
  );
}
