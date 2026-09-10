export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export type Id = { _id: string };
export type AddedDate = { addedDate: number };
export type LastUpdatedDate = { lastUpdatedDate: number };
export type HasBeenSaved = { hasBeenSaved: boolean };
export type NeedsSaving = { needsSaving: boolean };

/**
 *The example domain object used throughout this template to demonstrate the app's patterns
 *(redux slice + thunks, BFF service, forms, lists, tiles, modals, tests, etc). Rename/replace
 *this with your own domain type(s) when adapting the template.
 **/
export type Task = {
  /**
   *An optional value captured via the barcode/QR scanner (see `ScannerScreen` / `ScannerModal`).
   **/
  code: string;
  dueDate: number;
  imageToUseIndex: number;
  images: string[];
  isCompleted: boolean;
  notes: string;
  priority: TaskPriority;
  title: string;
} & Id &
  AddedDate &
  LastUpdatedDate &
  HasBeenSaved &
  NeedsSaving;

export type TasksList = Task[];

/**
 *A minimal identifier used to look up a {@link Task} in a list before its `_id` is known
 *(e.g. while still being drafted in the bulk-add flow).
 **/
export type Key = Pick<Task, '_id' | 'title' | 'code'>;

export type TaskProp = {
  task: Task;
};

export type TasksProp = {
  tasks: Task[];
};

export enum TaskTileViewingMode {
  Basic = 'Basic',
  Full = 'Full',
}
