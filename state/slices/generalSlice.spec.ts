import reducer, { setError } from './generalSlice';

describe('generalSlice', () => {
  it('adds an error even when the current errors list is undefined', () => {
    const nextState = reducer(
      {
        account: { email: '', password: '', _id: '' },
        errors: undefined,
        isUpToDate: false,
        lastSyncTime: 0,
        loadingMessage: '',
        shouldMockBffResponses: false,
        shouldSaveOnLogin: false,
      } as any,
      setError({
        message: 'Demo error',
        name: 'DemoError',
      }),
    );

    expect(nextState.errors).toHaveLength(1);
    expect(nextState.errors[0].message).toBe('Demo error');
  });
});
