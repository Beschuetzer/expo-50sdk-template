import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useMemo } from 'react';

import { TaskForm } from '@/components/forms/TaskForm';
import {
  canOverrideTaskSelector,
  autoSaveSelector,
} from '@/state/slices/optionsSlice';
import { tasksSelector } from '@/state/slices/tasksSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { saveTask } from '@/state/thunks';
import { Key, Task } from '@/types/Task';
import { getKeyToUse, getTaskFromList } from '@/utils/helpers';

export default function TaskModal() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute();
  const { key } = (route.params || {}) as { key?: Key };
  const canOverrideTask = useAppSelector(canOverrideTaskSelector);
  const autoSave = useAppSelector(autoSaveSelector);
  const tasks = useAppSelector(tasksSelector);

  const taskInList = useMemo(
    () => (key ? getTaskFromList(tasks, getKeyToUse(key)) : null),
    [key, tasks],
  );

  function handleClose() {
    navigation.canGoBack() && navigation.goBack();
  }

  function handleSave(task: Task) {
    dispatch(saveTask(task));
  }

  return (
    <TaskForm
      task={taskInList}
      tasks={tasks}
      canOverrideTask={canOverrideTask}
      autoSave={autoSave && !!taskInList}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
}
