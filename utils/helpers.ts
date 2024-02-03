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