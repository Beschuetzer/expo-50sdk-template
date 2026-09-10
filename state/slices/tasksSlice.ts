import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../store';

import { SortOrderValue } from '@/components/lists/sorters';
import { SORT_ORDER_VALUE_DEFAULT } from '@/constants/general';
import { Task } from '@/types/Task';

export type TasksState = {
  data: Task[];
  filterText: string;
  selectedIds: string[];
  sortOrderValue: SortOrderValue;
};

const initialState: TasksState = {
  data: [],
  filterText: '',
  selectedIds: [],
  sortOrderValue: SORT_ORDER_VALUE_DEFAULT,
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.data = action.payload || [];
    },
    addTask: (state, action: PayloadAction<Task>) => {
      const index = state.data.findIndex(
        (task) => task._id === action.payload._id,
      );
      if (index === -1) {
        state.data = [action.payload, ...state.data];
        return;
      }
      state.data[index] = action.payload;
    },
    addTasks: (state, action: PayloadAction<Task[]>) => {
      const existingIds = new Set(state.data.map((task) => task._id));
      const newTasks = action.payload.filter(
        (task) => !existingIds.has(task._id),
      );
      const updatedExisting = state.data.map(
        (task) =>
          action.payload.find((incoming) => incoming._id === task._id) || task,
      );
      state.data = [...newTasks, ...updatedExisting];
    },
    removeTasks: (state, action: PayloadAction<string[]>) => {
      const idsToRemove = new Set(action.payload);
      state.data = state.data.filter((task) => !idsToRemove.has(task._id));
      state.selectedIds = state.selectedIds.filter(
        (id) => !idsToRemove.has(id),
      );
    },
    toggleTaskCompleted: (state, action: PayloadAction<string>) => {
      const task = state.data.find((task) => task._id === action.payload);
      if (!task) return;
      task.isCompleted = !task.isCompleted;
      task.lastUpdatedDate = Date.now();
    },
    setFilterText: (state, action: PayloadAction<string>) => {
      state.filterText = action.payload || '';
    },
    setSortOrderValue: (state, action: PayloadAction<SortOrderValue>) => {
      state.sortOrderValue = action.payload || SORT_ORDER_VALUE_DEFAULT;
    },
    toggleSelected: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.selectedIds = state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id];
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
    resetTasksSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is PayloadAction<Task[]> =>
        action.type === 'loadTasks/fulfilled',
      (state, action) => {
        state.data = action.payload || [];
      },
    );
    builder.addMatcher(
      (action): action is PayloadAction<{ tasks: Task[] }> =>
        action.type === 'loadAll/fulfilled',
      (state, action) => {
        if (action.payload && 'tasks' in action.payload) {
          state.data = action.payload.tasks || state.data;
        }
      },
    );
  },
});

export const {
  addTask,
  addTasks,
  clearSelection,
  removeTasks,
  resetTasksSlice,
  setFilterText,
  setSortOrderValue,
  setTasks,
  toggleSelected,
  toggleTaskCompleted,
} = tasksSlice.actions;

export default tasksSlice.reducer;

export const tasksSelector = (state: RootState) => state[tasksSlice.name].data;

export const filterTextSelector = (state: RootState) =>
  state[tasksSlice.name].filterText;

export const sortOrderValueSelector = (state: RootState) =>
  state[tasksSlice.name].sortOrderValue;

export const selectedIdsSelector = (state: RootState) =>
  state[tasksSlice.name].selectedIds;
