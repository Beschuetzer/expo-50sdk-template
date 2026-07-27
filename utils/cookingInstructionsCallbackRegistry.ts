/**
 * A module-level registry for non-serializable callbacks that cannot be
 * passed as navigation params (React Navigation requires all params to be
 * serializable). Instead of passing `onSave` directly, the caller registers
 * it here and passes only the opaque key as a navigation param.
 */
import { CookingInstructions } from '@/types/Item';

type Callback = (updated: CookingInstructions) => void;

const registry = new Map<string, Callback>();
let counter = 0;

export function registerCookingCallback(cb: Callback): string {
  const key = `cooking_cb_${++counter}`;
  registry.set(key, cb);
  return key;
}

export function getCookingCallback(key: string): Callback | undefined {
  return registry.get(key);
}

export function removeCookingCallback(key: string): void {
  registry.delete(key);
}
