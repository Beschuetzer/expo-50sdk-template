import { getIsDevelopmentMode } from './environment';

export function logWhenDevelopmentMode(
  ...args: Parameters<typeof console.log>
): void {
  if (getIsDevelopmentMode()) {
    console.log(...args);
  }
}
