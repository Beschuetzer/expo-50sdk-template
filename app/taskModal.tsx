import {
  type NavigationProp,
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useMemo } from 'react';

import { TaskForm } from '@/components/forms/TaskForm';
import { type AppParamList, Routes } from '@/constants/navigation';
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
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const dispatch = useAppDispatch();
  const route = useRoute<RouteProp<AppParamList, typeof Routes.TaskModal>>();
  const { key } = route.params ?? {};
  const canOverrideTask = useAppSelector(canOverrideTaskSelector);
  const autoSave = useAppSelector(autoSaveSelector);
  const tasks = useAppSelector(tasksSelector);

  const taskInList = useMemo(() => {
    if (!key) return null;
    const normalizedKey = {
      _id: key._id,
      title: key.title || '',
      code: key.code || '',
    };
    return getTaskFromList(tasks, getKeyToUse(normalizedKey));
  }, [key, tasks]);

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
