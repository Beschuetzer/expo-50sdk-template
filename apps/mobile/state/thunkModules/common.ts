import type { Task } from '@/types/Task';
import type { Error } from '@/types/general';
import { logWhenDevelopmentMode } from '@/utils/logging';

export type DeleteTasksThunkInput = {
  ids: string[];
};

export type SaveAllThunkInput = {
  tasks: Task[];
};

type HandleErrorsWithRejectionInput = {
  dispatch: any;
  rejectWithValue: (value: unknown) => any;
  error: Error;
  response?: unknown;
  baseMsg: string;
  genericMsg?: string;
  shouldDisplayError?: boolean;
};

export function handleErrorsWithRejection(
  input: HandleErrorsWithRejectionInput,
) {
  const {
    rejectWithValue,
    error,
    response,
    baseMsg,
    genericMsg,
    shouldDisplayError = true,
  } = input;

  logWhenDevelopmentMode(baseMsg, { error, response });

  return rejectWithValue({
    message: shouldDisplayError
      ? `${baseMsg} ${genericMsg || error?.message || ''}`.trim()
      : error?.message,
    statusCode: error?.statusCode,
  } as Error);
}
