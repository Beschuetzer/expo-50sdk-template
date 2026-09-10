import { Dispatch } from '@reduxjs/toolkit';

import { ListFilterFilters } from '@/components/FilterListInput';
import {
  DAY_IN_MS,
  DURATION_INITIAL,
  EMPTY_NUMBER,
  EMPTY_STRING,
  ERROR_MODAL_STATUS_CODE_DEFAULT,
  HOUR_IN_MS,
  MONTH_IN_MS,
  TASK_PRIORITY_INITIAL,
  WEEK_IN_MS,
  YEAR_IN_MS,
} from '@/constants/general';
import { setError } from '@/state/slices/generalSlice';
import { setTasks } from '@/state/slices/tasksSlice';
import { Key, Task, TaskTileViewingMode } from '@/types/Task';
import { CredentialsNeeded, UserAccount } from '@/types/bffService';
import { Error, FileNames, State } from '@/types/general';
import { getKeyToUse } from '@/utils/strings';

export function getEmptyTask(): Task {
  return {
    _id: EMPTY_STRING,
    addedDate: Date.now(),
    code: EMPTY_STRING,
    dueDate: EMPTY_NUMBER,
    hasBeenSaved: false,
    images: [],
    imageToUseIndex: 0,
    isCompleted: false,
    lastUpdatedDate: Date.now(),
    needsSaving: true,
    notes: EMPTY_STRING,
    priority: TASK_PRIORITY_INITIAL,
    title: EMPTY_STRING,
  };
}

export function getTaskValidation(task?: Key) {
  const isValid = !!task?.title;
  return {
    isValid,
    message: isValid ? EMPTY_STRING : 'Please enter a title',
  };
}

export function getCustomImageInfo(task: Task): [string, number] {
  const defaultReturn = [EMPTY_STRING, -1] as [string, number];
  if (!task || !task.images || task.images.length === 0) return defaultReturn;
  const customImageUrlIndex = task.images.findIndex((image) =>
    image.match(/^(file|content):/),
  );
  const customImageUrl = task.images?.[customImageUrlIndex];
  if (!customImageUrl) return defaultReturn;
  return [customImageUrl, customImageUrlIndex];
}

export function getTaskForImport<T extends Key>(taskKey: string, tasks: T[]) {
  if (!taskKey || !tasks || tasks.length === 0) return null;
  return (
    tasks.find((task) => {
      if (task._id && taskKey === task._id) {
        return true;
      }
      if (task.code) {
        return (task.code || task.title) === taskKey;
      }
      return task.title === taskKey;
    }) || null
  );
}

export function getTaskFromList<T extends Key>(list: T[], key: string | Key) {
  const keyToUse = getKeyToUse(key);
  const itemFound =
    (list || []).find((item) => {
      if (item?._id) return item._id === keyToUse;
      if (item?.title && item?.code) return item.code === keyToUse;
      return item?.title === keyToUse;
    }) || null;
  return itemFound ? (itemFound as T) : null;
}

export function getIndexOfSmallestField<T>(arr: T[], key: keyof T) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return -1;
  }

  let smallestIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i][key] < arr[smallestIndex][key]) {
      smallestIndex = i;
    }
  }

  return smallestIndex;
}

export function getNewViewingMode(viewingMode: TaskTileViewingMode) {
  return viewingMode === TaskTileViewingMode.Basic
    ? TaskTileViewingMode.Full
    : TaskTileViewingMode.Basic;
}

export function getUserCredentials(
  userAccount: UserAccount,
): CredentialsNeeded {
  return {
    userId: userAccount._id || EMPTY_STRING,
    password: userAccount.password || EMPTY_STRING,
  };
}

export function handleError(
  dispatch: Dispatch,
  error: Error,
  message?: string,
) {
  dispatch(
    setError({
      message: message || error.message,
      error,
      statusCode: ERROR_MODAL_STATUS_CODE_DEFAULT,
    }),
  );
}

export function getFilteredList<T>(list: T[], filters: ListFilterFilters<T>) {
  return (list || []).filter((item) => {
    for (const [key, regex] of Object.entries(filters || {})) {
      const fieldValue = item?.[key as keyof T] as string;
      const isMatch = fieldValue?.match(new RegExp(regex as string, 'i'));
      if (!isMatch) return false;
    }
    return true;
  });
}

export function isAddressValid(address: {
  addressLineOne?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}) {
  const { addressLineOne, city, state, zipCode } = address || {};
  const isAddressValid = !!addressLineOne;
  const isLocationPresent = !!city || state !== State.None || !!zipCode;
  return !!(isAddressValid && isLocationPresent);
}

export function resetConfirmModalProps(
  setConfirmModalProps: (
    value: React.SetStateAction<{ isVisible: boolean }>,
  ) => void,
) {
  setConfirmModalProps({ isVisible: false });
}

export function setAppData(input: FileNames & { dispatch: Dispatch<any> }) {
  const { dispatch, tasks } = input;
  (tasks || []).forEach((task) => {
    if (!task._id) {
      task._id = `${Date.now()}-${Math.random()}`;
    }
    if (task.needsSaving == null) {
      task.needsSaving = true;
    }
  });
  dispatch(setTasks(tasks || []));
}

export function getDurationInMilliseconds(duration?: {
  number?: number;
  timeSpan?: keyof typeof TIME_SPAN_TO_MILLISECONDS_MAPPING;
}) {
  return (
    (duration?.number || DURATION_INITIAL.number) *
    TIME_SPAN_TO_MILLISECONDS_MAPPING?.[
      duration?.timeSpan || DURATION_INITIAL.timeSpan
    ]
  );
}

export const TIME_SPAN_TO_MILLISECONDS_MAPPING = {
  Hour: HOUR_IN_MS,
  Day: DAY_IN_MS,
  Week: WEEK_IN_MS,
  Month: MONTH_IN_MS,
  Year: YEAR_IN_MS,
} as const;
