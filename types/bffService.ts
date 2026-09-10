import { Dispatch } from '@reduxjs/toolkit';

import { Task } from './Task';
import { BulkWriteResult, DocumentResult } from './mongoose';

import { GenericResponse } from '@/components/services/AbstractService';

//#region General Types
export type CredentialsNeeded = UserIdNeeded & PasswordNeeded;
export type DispatchNeeded = {
  dispatch: Dispatch<any>;
};

export type EmailNeeded = { email: string };
/**
 *The mongodb _id for a user/task/etc
 **/
export type IdNeeded = { _id: string };
export type IdsNeeded = { ids: string[] };
export type NewPasswordNeeded = { newPassword: string };
export type PasswordNeeded = { password: string };
export type TaskNeeded = { task: Task };
export type TasksNeeded = { tasks: Task[] };
export type UserNeeded<T> = { user: T };
export type UserIdNeeded = { userId: string };
export type UserAccount = {
  _id: string;
  email: string;
  password: string;
};
export type UserAccountInput = {
  email: string;
  password: string;
};

/**
 *The shape the server uses to acknowledge a bulk delete/update.
 **/
export type DeletionResponse = {
  acknowledged: boolean;
  deletedCount: number;
};
//#endregion

//#region Input Types
export type ChangePasswordInput = CredentialsNeeded &
  DispatchNeeded &
  NewPasswordNeeded;
export type DeleteS3ObjectsInput = { objKeys: string[] } & DispatchNeeded &
  CredentialsNeeded;
export type DeleteTasksInput = IdsNeeded & DispatchNeeded & CredentialsNeeded;
export type DeleteTasksRequest = IdsNeeded & UserIdNeeded & PasswordNeeded;
export type DeleteUserInput = DispatchNeeded & CredentialsNeeded;
export type GetSignedUrlInput = { filename: string } & UserIdNeeded &
  PasswordNeeded &
  DispatchNeeded;
export type GetUserTasksInput = DispatchNeeded & UserIdNeeded;
export type LoadAllFromDbInput = DispatchNeeded & UserIdNeeded & PasswordNeeded;
export type MakeCallInput = {
  body?: string;
  errorMsg: string;
  loadingMsg: string;
  options?: RequestInit;
  path: string;
  showLoadingMsg?: boolean;
  showErrorMsg?: boolean;
  /**
   *If `true`, {@link MakeCallInput.errorMsg errorMsg} will always be used.
   **/
  useErrorMessage?: boolean;
} & DispatchNeeded;
export type PingInput = DispatchNeeded;
export type SaveAllToDbInput = TasksNeeded & DispatchNeeded & CredentialsNeeded;
export type SaveTaskInput = TaskNeeded & DispatchNeeded & CredentialsNeeded;
export type SaveTaskRequest = { task: Task } & UserIdNeeded & PasswordNeeded;
export type SaveTasksInput = TasksNeeded & DispatchNeeded & CredentialsNeeded;
export type SaveTasksRequest = { tasks: Task[] } & UserIdNeeded &
  PasswordNeeded;
//#endregion

//#region Response Types
export type ChangePasswordResponse = { success: boolean } | GenericResponse;
export type CreateUserResponse = UserAccount | GenericResponse;
export type DeleteTasksResponse = DeletionResponse | GenericResponse;
export type DeleteUserResponse =
  | { deletedUser: { _id: string } }
  | GenericResponse;
export type GetUserTasksResponse = Task[] | GenericResponse;
export type LoadAllResponse = { tasks: Task[] } | GenericResponse;
export type LoginResponse = UserAccount | GenericResponse;
export type PingResponse =
  | { success: boolean; timestamp: number }
  | GenericResponse;
export type SaveAllResponse = { success: boolean } | GenericResponse;
export type SaveTaskResponse = DocumentResult<Task> | GenericResponse;
export type SaveTasksResponse = BulkWriteResult | GenericResponse;
export type SignedUrlResponse =
  | { signedUrl: string; publicUrl: string }
  | GenericResponse;
//#endregion
