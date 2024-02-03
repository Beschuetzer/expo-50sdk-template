import { Key } from "@/types/Item";
import { PayloadAction } from "@reduxjs/toolkit";

export async function delay(ms: number) {
    if (ms <= 0) return;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, ms)
    })
}

export function getEmptyArray<T>() {
    return [] as T;
}

export function getEmptyObject<T>() {
  return {} as T;
}

export function getKeyToUse(action: PayloadAction<Key>) {
  return action?.payload?.upc || action?.payload?.name;
}