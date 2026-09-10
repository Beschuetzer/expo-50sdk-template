import { AbstractService } from './AbstractService';

import { setError } from '@/state/slices/generalSlice';
import {
  ChangePasswordInput,
  ChangePasswordResponse,
  CreateUserResponse,
  DeleteS3ObjectsInput,
  DeleteTasksInput,
  DeleteTasksRequest,
  DeleteTasksResponse,
  DeleteUserInput,
  DeleteUserResponse,
  DispatchNeeded,
  EmailNeeded,
  GetSignedUrlInput,
  GetUserTasksInput,
  GetUserTasksResponse,
  LoadAllFromDbInput,
  LoadAllResponse,
  LoginResponse,
  PingInput,
  PingResponse,
  SaveAllResponse,
  SaveAllToDbInput,
  SaveTaskInput,
  SaveTaskRequest,
  SaveTaskResponse,
  SaveTasksInput,
  SaveTasksRequest,
  SaveTasksResponse,
  SignedUrlResponse,
  UserAccountInput,
  UserNeeded,
} from '@/types/bffService';
import { getBackendUrl, getIsDevelopmentMode } from '@/utils/helpers';

function displayAlert(object: object | null) {
  alert(object ? JSON.stringify(object, null, 2) : object);
}

export const PING_PATH = '/ping';
export const S3_PATH = '/s3';
export const TASK_PATH = '/task';
export const USER_PATH = '/user';

class BffService extends AbstractService {
  constructor() {
    super(getBackendUrl());
    if (getIsDevelopmentMode()) {
      displayAlert({
        bffServiceBaseUrl: this._baseUrl,
        EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
      });
    }
  }

  //#region Auth
  async changePassword(input: ChangePasswordInput) {
    const { userId, password, dispatch, newPassword } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) {
      return;
    }
    const body = JSON.stringify({ _id: userId, password, newPassword });
    return await this.makeCall<ChangePasswordResponse>({
      dispatch,
      body,
      options: { method: 'POST' },
      path: `${USER_PATH}/changePassword`,
      errorMsg: `Unable to change password for user with id of '${userId}'`,
      loadingMsg: `Changing password for user with id of '${userId}'...`,
    });
  }

  async createUser(input: UserNeeded<UserAccountInput> & DispatchNeeded) {
    const { user, dispatch } = input || {};
    if (!user) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No user account given in createUser()',
        }),
      );
      return;
    }
    const body = JSON.stringify(user);
    return await this.makeCall<CreateUserResponse>({
      dispatch,
      body,
      options: { method: 'POST' },
      path: USER_PATH,
      errorMsg: `Unable to create user with email of '${user.email}'`,
      loadingMsg: `Creating user with email of '${user.email}'...`,
    });
  }

  async checkIsEmailAvailable(input: EmailNeeded & DispatchNeeded) {
    const { email, dispatch } = input || {};
    if (!email) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No email given in checkIsEmailAvailable',
        }),
      );
      return;
    }
    return await this.makeCall<boolean>({
      dispatch,
      path: `${USER_PATH}/isEmailAvailable/${email}`,
      errorMsg: `Unable to verify whether '${email}' is available.`,
      loadingMsg: `Checking if '${email}' is available...`,
    });
  }

  async deleteUser(input: DeleteUserInput) {
    const { userId, password, dispatch } = input || {};
    if (!this.validateCredentials(userId, password, dispatch)) {
      return;
    }
    return await this.makeCall<DeleteUserResponse>({
      dispatch,
      body: JSON.stringify({ _id: userId, password }),
      options: { method: 'DELETE' },
      path: USER_PATH,
      errorMsg: `Unable to delete user with id of '${userId}'`,
      loadingMsg: 'Deleting user...',
    });
  }

  async login(input: UserNeeded<UserAccountInput> & DispatchNeeded) {
    const { user, dispatch } = input || {};
    if (!user?.email || !user?.password) {
      dispatch(
        setError({
          statusCode: 500,
          message: 'No credentials given in login()',
        }),
      );
      return;
    }
    return await this.makeCall<LoginResponse>({
      dispatch,
      body: JSON.stringify(user),
      options: { method: 'POST' },
      path: `${USER_PATH}/login`,
      errorMsg: `Unable to login as '${user.email}'`,
      loadingMsg: 'Logging in...',
    });
  }
  //#endregion

  //#region Tasks
  async getUserTasks(input: GetUserTasksInput) {
    const { userId, dispatch } = input || {};
    return await this.makeCall<GetUserTasksResponse>({
      path: `${TASK_PATH}/user/${userId}`,
      errorMsg: 'Unable to fetch tasks',
      loadingMsg: 'Fetching tasks...',
      dispatch,
    });
  }

  async saveTask(input: SaveTaskInput) {
    const { dispatch, task, userId, password } = input;
    const request: SaveTaskRequest = { task, userId, password };
    return await this.makeCall<SaveTaskResponse>({
      path: TASK_PATH,
      body: JSON.stringify(request),
      options: { method: 'POST' },
      errorMsg: 'Unable to save task',
      loadingMsg: 'Saving task...',
      dispatch,
    });
  }

  async saveTasks(input: SaveTasksInput) {
    const { dispatch, tasks, userId, password } = input;
    const request: SaveTasksRequest = { tasks, userId, password };
    return await this.makeCall<SaveTasksResponse>({
      path: `${TASK_PATH}/bulk`,
      body: JSON.stringify(request),
      options: { method: 'POST' },
      errorMsg: 'Unable to save tasks',
      loadingMsg: 'Saving tasks...',
      dispatch,
    });
  }

  async deleteTasks(input: DeleteTasksInput) {
    const { dispatch, ids, userId, password } = input;
    const request: DeleteTasksRequest = { ids, userId, password };
    return await this.makeCall<DeleteTasksResponse>({
      path: TASK_PATH,
      body: JSON.stringify(request),
      options: { method: 'DELETE' },
      errorMsg: 'Unable to delete tasks',
      loadingMsg: 'Deleting tasks...',
      dispatch,
    });
  }
  //#endregion

  //#region Sync
  async saveAllToDb(input: SaveAllToDbInput) {
    const { dispatch, tasks, userId, password } = input;
    return await this.makeCall<SaveAllResponse>({
      path: `${USER_PATH}/saveAll`,
      body: JSON.stringify({ tasks, userId, password }),
      options: { method: 'POST' },
      errorMsg: 'Unable to save app data',
      loadingMsg: 'Saving app data...',
      dispatch,
    });
  }

  async loadAllFromDb(input: LoadAllFromDbInput) {
    const { dispatch, userId, password } = input;
    return await this.makeCall<LoadAllResponse>({
      path: `${USER_PATH}/loadAll/${userId}`,
      body: JSON.stringify({ password }),
      errorMsg: 'Unable to load app data',
      loadingMsg: 'Loading app data...',
      dispatch,
    });
  }

  async ping(input: PingInput) {
    const { dispatch } = input;
    return await this.makeCall<PingResponse>({
      path: PING_PATH,
      errorMsg: 'Unable to reach the backend',
      loadingMsg: EMPTY_LOADING_MSG,
      showLoadingMsg: false,
      showErrorMsg: false,
      dispatch,
    });
  }
  //#endregion

  //#region Files
  async getSignedUrl(input: GetSignedUrlInput) {
    const { dispatch, filename, userId, password } = input;
    return await this.makeCall<SignedUrlResponse>({
      path: `${S3_PATH}/signedUrl`,
      body: JSON.stringify({ filename, userId, password }),
      options: { method: 'POST' },
      errorMsg: 'Unable to get a signed upload url',
      loadingMsg: 'Preparing upload...',
      dispatch,
    });
  }

  async deleteS3Objects(input: DeleteS3ObjectsInput) {
    const { dispatch, objKeys, userId, password } = input;
    return await this.makeCall<boolean>({
      path: S3_PATH,
      body: JSON.stringify({ objKeys, userId, password }),
      options: { method: 'DELETE' },
      errorMsg: 'Unable to delete uploaded file(s)',
      loadingMsg: 'Deleting file(s)...',
      dispatch,
    });
  }
  //#endregion
}

const EMPTY_LOADING_MSG = '';

export const BFF_SERVICE = new BffService();
