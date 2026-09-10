import { createAsyncThunk } from '@reduxjs/toolkit';

import { type SaveAllThunkInput, handleErrorsWithRejection } from './common';

import { BFF_SERVICE } from '@/components/services/BffService';
import { setTasks } from '@/state/slices/tasksSlice';
import type { RootState } from '@/state/store';
import type { LoadAllResponse, SaveAllResponse } from '@/types/bffService';
import type { Error } from '@/types/general';
import { getUserCredentials } from '@/utils/helpers';

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
