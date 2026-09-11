import { BFF_SERVICE, TASK_PATH } from '@/components/services/BffService';
import { Task, TaskPriority } from '@/types/Task';

// BffService -> AbstractService -> generalSlice -> thunks -> GeoCodingService
// -> AbstractService forms a circular import chain (a pre-existing condition
// in the codebase). Stubbing this out avoids a "Super expression must either
// be null or a function" error caused by the cycle under Jest's CJS interop.
jest.mock('@/components/services/GeoCodingService', () => ({
  GEO_CODING_SERVICE: {},
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    _id: 'task-1',
    addedDate: Date.now(),
    code: '',
    dueDate: 0,
    hasBeenSaved: false,
    imageToUseIndex: 0,
    images: [],
    isCompleted: false,
    lastUpdatedDate: Date.now(),
    needsSaving: true,
    notes: '',
    priority: TaskPriority.Medium,
    title: 'Buy groceries',
    ...overrides,
  };
}

function mockFetchResponse(body: unknown, ok = true) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => body,
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('BFF_SERVICE.saveTask', () => {
  it('saves a task and returns the response', async () => {
    const dispatch = jest.fn();
    const task = makeTask();
    const response = { userId: 'user-1', _id: task._id, values: task };
    mockFetchResponse(response);

    const result = await BFF_SERVICE.saveTask({
      task,
      dispatch,
      userId: 'user-1',
      password: 'password123',
    });

    expect(result).toEqual(response);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(TASK_PATH);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      task,
      userId: 'user-1',
      password: 'password123',
    });
  });

  it('surfaces an error response without throwing', async () => {
    const dispatch = jest.fn();
    mockFetchResponse({ errorResponse: { message: 'nope' } }, false);

    const result = await BFF_SERVICE.saveTask({
      task: makeTask(),
      dispatch,
      userId: 'user-1',
      password: 'password123',
    });

    // AbstractService.makeCall returns `null` for non-aborted errors
    // (only aborted requests resolve to `undefined`).
    expect(result).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'general/setError' }),
    );
  });
});

describe('BFF_SERVICE.getUserTasks', () => {
  it('fetches tasks for a user', async () => {
    const dispatch = jest.fn();
    const tasks = [makeTask()];
    mockFetchResponse(tasks);

    const result = await BFF_SERVICE.getUserTasks({
      userId: 'user-1',
      dispatch,
    });

    expect(result).toEqual(tasks);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`${TASK_PATH}/user/user-1`);
  });
});

describe('BFF_SERVICE.deleteTasks', () => {
  it('deletes tasks by id', async () => {
    const dispatch = jest.fn();
    const response = { acknowledged: true, deletedCount: 2 };
    mockFetchResponse(response);

    const result = await BFF_SERVICE.deleteTasks({
      ids: ['task-1', 'task-2'],
      dispatch,
      userId: 'user-1',
      password: 'password123',
    });

    expect(result).toEqual(response);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(TASK_PATH);
    expect(options.method).toBe('DELETE');
  });
});
