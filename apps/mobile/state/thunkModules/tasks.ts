import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  type DeleteTasksThunkInput,
  handleErrorsWithRejection,
} from './common';

import { BFF_SERVICE } from '@/components/services/BffService';
import {
  addTask,
  addTasks,
  removeTasks,
  setTasks,
} from '@/state/slices/tasksSlice';
import type { RootState } from '@/state/store';
import type { Task } from '@/types/Task';
import type {
  DeleteTasksResponse,
  SaveTaskResponse,
  SaveTasksResponse,
} from '@/types/bffService';
import type { Error } from '@/types/general';
import { getUserCredentials } from '@/utils/helpers';

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
