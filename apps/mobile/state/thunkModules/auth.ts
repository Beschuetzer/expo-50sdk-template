import { createAsyncThunk } from '@reduxjs/toolkit';

import { handleErrorsWithRejection } from './common';
import { saveAll } from './sync';

import { BFF_SERVICE } from '@/components/services/BffService';
import { ACCOUNT_INITIAL, setAccount } from '@/state/slices/generalSlice';
import type { RootState } from '@/state/store';
import type {
  ChangePasswordResponse,
  CreateUserResponse,
  DeleteUserResponse,
  LoginResponse,
  PingResponse,
  UserAccountInput,
} from '@/types/bffService';
import type { Error } from '@/types/general';
import { getUserCredentials } from '@/utils/helpers';

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
