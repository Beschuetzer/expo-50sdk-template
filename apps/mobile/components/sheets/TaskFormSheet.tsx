import {
  BottomSheetMethods,
  BottomSheetModalMethods,
} from '@gorhom/bottom-sheet/lib/typescript/types';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import {
  BottomSheetModalWithFixedHeader,
  BottomSheetModalWithFixedHeaderProps,
} from '../BottomSheetModalWithFixedHeader';
import { TaskForm } from '../forms/TaskForm';

import { tasksSelector } from '@/state/slices/tasksSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { saveTask } from '@/state/thunks';
import { TaskFormOnSave, TaskFormProps } from '@/types/taskForm';

type TaskFormSheetProps = {
  bottomSheetProps?: Omit<
    Partial<BottomSheetModalWithFixedHeaderProps>,
    'title'
  >;
  task: TaskFormProps['task'];
  taskFormProps?: Partial<TaskFormProps>;
  title: string;
};

export const TaskFormSheet = forwardRef<BottomSheetMethods, TaskFormSheetProps>(
  (props, ref) => {
    const { title, bottomSheetProps, taskFormProps, task } = props;
    const { onSave } = taskFormProps || ({} as TaskFormProps);
    const { onSubmit, onClose } =
      bottomSheetProps || ({} as BottomSheetModalWithFixedHeaderProps);
    const innerRef = useRef<BottomSheetModalMethods>(null);
    useImperativeHandle(ref, () => innerRef.current as BottomSheetModalMethods);
    const dispatch = useAppDispatch();
    const tasks = useAppSelector(tasksSelector);
    const currentSavePayloadRef = useRef<Parameters<TaskFormOnSave>[0]>();

    const onCloseLocal = useCallback(() => {
      onClose && onClose();
      innerRef.current?.close();
    }, [onClose]);

    const onSubmitLocal = useCallback(() => {
      onSubmit && onSubmit();
      innerRef.current?.close();
      if (currentSavePayloadRef.current) {
        dispatch(saveTask(currentSavePayloadRef.current));
      }
    }, [onSubmit, dispatch]);

    const onSaveLocal: TaskFormOnSave = useCallback(
      (task) => {
        currentSavePayloadRef.current = task;
        onSave && onSave(task);
      },
      [onSave],
    );

    return (
      <BottomSheetModalWithFixedHeader
        useFullscreen
        {...bottomSheetProps}
        ref={innerRef}
        title={title}
        onSubmit={onSubmitLocal}
        onClose={onCloseLocal}
        closeButton={{ text: 'Cancel' }}
      >
        <TaskForm
          autoSave
          autoSaveDebounce={0}
          task={task}
          tasks={tasks}
          canOverrideTask={false}
          onSave={onSaveLocal}
          {...taskFormProps}
        />
      </BottomSheetModalWithFixedHeader>
    );
  },
);
TaskFormSheet.displayName = 'TaskFormSheet';
