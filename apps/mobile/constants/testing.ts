import { SortOrder, SortType } from '@/components/lists/sorters';
import { getRandomTask } from '@/components/mocks/helpers';
import { Task, TaskPriority } from '@/types/Task';

export const MOCK_TASK_TITLES = [
  'Buy groceries',
  'Write report',
  'Call dentist',
  'Fix bike tire',
  'Plan trip',
  'Read book',
  'Water plants',
  'Clean garage',
];

export const MOCK_TASKS: Task[] = MOCK_TASK_TITLES.map((title, index) =>
  getRandomTask(`${index}-${title}`),
);

export const MOCK_SORT_ORDER_VALUE = {
  sortOrder: SortOrder.Ascending,
  sortBy: SortType.Title,
};

export const TASK_PRIORITIES_FOR_TESTING = Object.values(TaskPriority);
