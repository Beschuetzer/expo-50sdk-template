import { Task } from './Task';

export type TaskFormData = Pick<
  Task,
  'title' | 'notes' | 'code' | 'priority' | 'dueDate' | 'isCompleted'
> & {
  _id: string;
  images: string[];
  imageToUseIndex: number;
};

export type TaskFormOnSave = (task: Task) => void;

export type TaskFormProps = {
  autoSave?: boolean;
  autoSaveDebounce?: number;
  canOverrideTask?: boolean;
  onClose?: () => void;
  onSave?: TaskFormOnSave;
  task?: Task | null;
  tasks?: Task[];
};
