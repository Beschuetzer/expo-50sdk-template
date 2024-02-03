export async function delay(ms: number) {
    if (ms <= 0) return;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, ms)
    })
}