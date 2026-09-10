import { Task } from './Task';

export type BulkAddMode = 'append' | 'replace';

/**
 *A single draft line parsed out of the pasted text in {@link BulkAddTasksModal}, before
 *the user has confirmed/edited it into a real {@link Task}.
 **/
export type TaskDraft = Pick<Task, 'title'> & Partial<Omit<Task, 'title'>>;

/**
 *Map of draft title -> existing tasks that look similar (fuzzy-matched via `fuzzball`), so the
 *user can link a pasted line to an existing task instead of creating a duplicate.
 **/
export type BulkAddGuesses = Record<string, [Task, number][]>;

export type BulkAddList = {
  drafts: TaskDraft[];
};

export type BulkAddState = {
  bulkAddList: BulkAddList;
  mode: BulkAddMode;
};
