import { createAsyncThunk } from '@reduxjs/toolkit';

import { ACCOUNT_INITIAL, setAccount } from './slices/generalSlice';
import { addTask, addTasks, removeTasks, setTasks } from './slices/tasksSlice';
import { RootState } from './store';

import { BFF_SERVICE } from '@/components/services/BffService';
import { Task } from '@/types/Task';
import {
  ChangePasswordResponse,
  CreateUserResponse,
  DeleteTasksResponse,
  DeleteUserResponse,
  LoadAllResponse,
  LoginResponse,
  PingResponse,
  SaveAllResponse,
  SaveTaskResponse,
  SaveTasksResponse,
  UserAccountInput,
} from '@/types/bffService';
import { Error } from '@/types/general';
import { getUserCredentials } from '@/utils/helpers';
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

/**
 *Shared by every thunk below: logs + optionally surfaces the error (via the `general` slice,
 *which `ErrorModal` listens to) and rejects the thunk's promise with a normalized payload.
 **/
function handleErrorsWithRejection(input: HandleErrorsWithRejectionInput) {
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

//#region Auth
export const changePassword = createAsyncThunk(
  'changePassword',
  async (newPassword: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const account = state.general?.account;
    let response: ChangePasswordResponse;
    try {
      response = await BFF_SERVICE.changePassword({
        ...getUserCredentials(account),
        newPassword,
        dispatch,
      });
      if (!response?.success) {
        throw new Error('Error changing the user password');
      }
      dispatch(setAccount({ ...account, password: newPassword }));
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to change the user password for user account '${account._id}'.`,
      });
    }
  },
);

export const createUser = createAsyncThunk(
  'createUser',
  async (user: UserAccountInput, { dispatch, rejectWithValue }) => {
    let response: CreateUserResponse;
    try {
      response = await BFF_SERVICE.createUser({ user, dispatch });
      if (!response?._id) {
        throw new Error('Error creating user account');
      }
      dispatch(setAccount({ ...response, password: user?.password }));
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to create the user account for '${user?.email}'.`,
      });
    }
  },
);

export const deleteUser = createAsyncThunk(
  'deleteUser',
  async (_: void, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const account = state.general?.account;
    let response: DeleteUserResponse;
    try {
      if (!account) {
        throw new Error('No user account found to delete.');
      }
      response = await BFF_SERVICE.deleteUser({
        ...getUserCredentials(account),
        dispatch,
      });
      if (!response?.deletedUser?._id) {
        throw new Error('No user account was deleted');
      }
      dispatch(setAccount(ACCOUNT_INITIAL));
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to delete the user account for '${account._id}'.`,
      });
    }
  },
);

export const login = createAsyncThunk(
  'login',
  async (user: UserAccountInput, { dispatch, getState, rejectWithValue }) => {
    let response: LoginResponse;
    try {
      response = await BFF_SERVICE.login({ user, dispatch });
      if (!response?._id) {
        throw new Error('No user account was found.');
      }
      dispatch(setAccount({ ...response, password: user.password }));

      const state = getState() as RootState;
      if (state.general.shouldSaveOnLogin) {
        dispatch(saveAll({ tasks: state.tasks.data }));
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: `Unable to login as '${user.email}'.`,
        genericMsg: 'Please check your credentials.',
      });
    }
  },
);

export const pingBff = createAsyncThunk(
  'pingBff',
  async (_: void, { dispatch, rejectWithValue }) => {
    let response: PingResponse;
    try {
      response = await BFF_SERVICE.ping({ dispatch });
      if (!response?.success) {
        throw new Error('The backend did not respond successfully.');
      }
      return response;
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: 'Unable to reach the backend.',
        shouldDisplayError: false,
      });
    }
  },
);
//#endregion

//#region Tasks
/**
 *Every "save"/"delete" thunk below follows the same offline-friendly pattern used throughout
 *this template: local redux state is updated in the `finally` block *regardless* of whether the
 *network call succeeded, so the UI never blocks on connectivity. If the network call fails, the
 *`general` slice's `isUpToDate` flag flips to `false` (see its `extraReducers`) so the rest of the
 *app can surface a "needs sync" indicator and try again later (e.g. via `saveAll`).
 **/
export const loadTasks = createAsyncThunk(
  'loadTasks',
  async (_: void, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const account = state.general.account;
    try {
      if (!account._id) {
        throw new Error('No account found.');
      }
      const response = await BFF_SERVICE.getUserTasks({
        userId: account._id,
        dispatch,
      });
      if (!Array.isArray(response)) {
        throw new Error('Unable to load tasks.');
      }
      dispatch(setTasks(response));
      return response;
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        baseMsg: 'Error loading tasks.',
      });
    }
  },
);

export const saveTask = createAsyncThunk(
  'saveTask',
  async (task: Task, { getState, dispatch, rejectWithValue }) => {
    let response: SaveTaskResponse;
    let shouldDisplayError = true;
    try {
      const state = getState() as RootState;
      const account = state.general.account;
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }
      response = await BFF_SERVICE.saveTask({
        task,
        ...getUserCredentials(account),
        dispatch,
      });
      if (!response) {
        shouldDisplayError = false;
        throw new Error('Unable to save task.');
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: 'Error saving task.',
        shouldDisplayError,
      });
    } finally {
      dispatch(addTask(task));
    }
  },
);

export const saveTasks = createAsyncThunk(
  'saveTasks',
  async (tasks: Task[], { getState, dispatch, rejectWithValue }) => {
    let response: SaveTasksResponse;
    let shouldDisplayError = true;
    try {
      if (!tasks || tasks.length === 0) {
        throw new Error('No tasks given to save.');
      }
      const state = getState() as RootState;
      const account = state.general.account;
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }
      response = await BFF_SERVICE.saveTasks({
        tasks,
        ...getUserCredentials(account),
        dispatch,
      });
      if (!response) {
        shouldDisplayError = false;
        throw new Error('Unable to save tasks.');
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: 'Error saving tasks.',
        shouldDisplayError,
      });
    } finally {
      dispatch(addTasks(tasks));
    }
  },
);

export const deleteTasks = createAsyncThunk(
  'deleteTasks',
  async (
    input: DeleteTasksThunkInput,
    { getState, dispatch, rejectWithValue },
  ) => {
    let response: DeleteTasksResponse;
    let shouldDisplayError = true;
    try {
      const { ids } = input;
      if (!ids || ids.length === 0) {
        throw new Error('No task ids given to delete.');
      }
      const state = getState() as RootState;
      const account = state.general.account;
      if (!account._id || !account.password) {
        shouldDisplayError = false;
        throw new Error('No account found.');
      }
      response = await BFF_SERVICE.deleteTasks({
        ids,
        ...getUserCredentials(account),
        dispatch,
      });
      if (!response) {
        shouldDisplayError = false;
        throw new Error('Unable to delete tasks.');
      }
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: 'Error deleting tasks.',
        shouldDisplayError,
      });
    } finally {
      dispatch(removeTasks(input.ids));
    }
  },
);

/**
 *Pushes the full local state to the backend - used by the "sync now" button in `AccountScreen`
 *and automatically on login when the `shouldSaveOnLogin` option is enabled.
 **/
export const saveAll = createAsyncThunk(
  'saveAll',
  async (input: SaveAllThunkInput, { getState, dispatch, rejectWithValue }) => {
    let response: SaveAllResponse;
    try {
      const state = getState() as RootState;
      const account = state.general.account;
      if (!account._id || !account.password) {
        throw new Error('No account found.');
      }
      response = await BFF_SERVICE.saveAllToDb({
        tasks: input.tasks,
        ...getUserCredentials(account),
        dispatch,
      });
      if (!response?.success) {
        throw new Error('Unable to save app data to the database.');
      }
      return response;
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: 'Error saving app data.',
      });
    }
  },
);

export const loadAll = createAsyncThunk(
  'loadAll',
  async (_: void, { getState, dispatch, rejectWithValue }) => {
    let response: LoadAllResponse;
    try {
      const state = getState() as RootState;
      const account = state.general.account;
      if (!account._id || !account.password) {
        throw new Error('No account found.');
      }
      response = await BFF_SERVICE.loadAllFromDb({
        ...getUserCredentials(account),
        dispatch,
      });
      if (!response?.tasks) {
        throw new Error('Unable to load app data.');
      }
      dispatch(setTasks(response.tasks));
      return response;
    } catch (error) {
      return handleErrorsWithRejection({
        dispatch,
        rejectWithValue,
        error: error as Error,
        response,
        baseMsg: 'Error loading app data.',
      });
    }
  },
);
//#endregion
