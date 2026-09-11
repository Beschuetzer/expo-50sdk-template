function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys.map((key) => `${key}:${stableStringify(obj[key])}`).join(',') +
    '}'
  );
}

function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return hash >>> 0;
}

export function getHash(obj: any): number {
  const stringifiedObj = stableStringify(obj);
  return djb2Hash(stringifiedObj);
}
