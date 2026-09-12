import {
  reportDiagnostic,
  setCrashReporter,
  type CrashReporter,
} from './diagnostics';

describe('diagnostics', () => {
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  afterEach(() => {
    setCrashReporter(undefined);
    consoleError.mockClear();
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it('forwards errors and context to the configured crash reporter', () => {
    const reporter: CrashReporter = jest.fn();
    const error = new Error('boundary failure');
    const context = { source: 'ErrorBoundary' };

    setCrashReporter(reporter);
    reportDiagnostic(error, context);

    expect(reporter).toHaveBeenCalledWith(error, context);
    expect(consoleError).toHaveBeenCalled();
  });

  it('keeps diagnostics from throwing when the crash reporter fails', () => {
    setCrashReporter(() => {
      throw new Error('reporter failure');
    });

    expect(() => reportDiagnostic(new Error('original failure'), {})).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(
      'Crash reporter failed:',
      expect.any(Error),
    );
  });
});
