import type { Task } from '@/types/Task';

export enum Routes {
  AccountScreen = 'AccountScreen',
  BffServiceTestScreen = 'BffServiceTestScreen',
  BulkAddTasksModal = 'BulkAddTasksModal',
  DashboardScreen = 'index',
  DevOptionsScreen = 'DevOptionsScreen',
  FullscreenImageScreen = 'FullscreenImageScreen',
  OptionsScreen = 'OptionsScreen',
  PasswordResetScreen = 'PasswordResetScreen',
  ScannerScreen = 'ScannerScreen',
  ShareIntentScreen = 'ShareIntentScreen',
  TaskModal = 'taskModal',
  TasksScreen = 'TasksScreen',
}

export type TaskModalRouteKey = Pick<Task, '_id'> &
  Partial<Pick<Task, 'title' | 'code' | 'notes'>>;

export type AppParamList = {
  [Routes.AccountScreen]: undefined;
  [Routes.BffServiceTestScreen]: undefined;
  [Routes.BulkAddTasksModal]: undefined;
  [Routes.DashboardScreen]: undefined;
  [Routes.DevOptionsScreen]: undefined;
  [Routes.FullscreenImageScreen]: { task?: Partial<Task> };
  [Routes.OptionsScreen]: undefined;
  [Routes.PasswordResetScreen]: undefined;
  [Routes.ScannerScreen]: undefined;
  [Routes.ShareIntentScreen]: { mockUrl?: string };
  [Routes.TaskModal]: { key?: TaskModalRouteKey };
  [Routes.TasksScreen]: undefined;
};
