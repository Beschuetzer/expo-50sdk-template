import { cleanPersistedGeneralState } from './store';

describe('cleanPersistedGeneralState', () => {
  it('removes transient error data before persisting the general slice', () => {
    const state = {
      account: { email: 'user@example.com', password: 'secret', _id: 'abc' },
      errors: [
        {
          message: 'boom',
          stack: 'stack trace here',
          statusCode: 500,
        },
      ],
      isUpToDate: true,
      lastSyncTime: 123,
      loadingMessage: 'syncing',
      shouldMockBffResponses: false,
      shouldSaveOnLogin: true,
    };

    expect(cleanPersistedGeneralState(state)).toEqual({
      account: { email: 'user@example.com', password: 'secret', _id: 'abc' },
      isUpToDate: true,
      lastSyncTime: 123,
      loadingMessage: 'syncing',
      shouldMockBffResponses: false,
      shouldSaveOnLogin: true,
    });
  });
});
