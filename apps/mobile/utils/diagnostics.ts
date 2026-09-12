import { getIsDevelopmentMode } from './environment';

export type CrashReporter = (
  error: unknown,
  context: Record<string, unknown>,
) => void;

let crashReporter: CrashReporter | undefined;

export function setCrashReporter(reporter: CrashReporter | undefined): void {
  crashReporter = reporter;
}

export function reportDiagnostic(
  error: unknown,
  context: Record<string, unknown>,
): void {
  try {
    crashReporter?.(error, context);
  } catch (reporterError) {
    console.error('Crash reporter failed:', reporterError);
  }

  if (getIsDevelopmentMode()) {
    console.error('Mobile diagnostic:', context, error);
  } else {
    console.error('Mobile diagnostic:', context);
  }
}
