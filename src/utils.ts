// export function makeSeparatedStore(defineStore: Function) {
//   const definedStores = new Map()
//   return (storeKey: string) => {
//     if (!definedStores.has(storeKey)) {
//       definedStores.set(storeKey, defineStore(storeKey))
//     }
//     return definedStores.get(storeKey)()
//   }
// }

export function makeSeparatedStore<
  T extends (storeKey: string) => any,
  K extends T extends (storeKey: string) => infer StoreDef ? StoreDef : never,
>(defineStore: T) {
  const definedStores = new Map<string, K>();

  return (
    storeKey: string,
  ): ReturnType<K> => {
    if (!definedStores.has(storeKey)) {
      definedStores.set(storeKey, defineStore(storeKey));
    }

    // @ts-expect-error
    return definedStores.get(storeKey)();
  };
}

export function pick<T, K extends keyof T>(obj: T, keys: (K | { [P in keyof T]?: (keyof T[P])[] })[]): { [P in K]: T[P] } {
  const result: { [P in K]: T[P] } = {};
  for (const key of keys) {
    if (typeof key === 'object') {
      const nestedKey = Object.keys(key)[0] as keyof T;
      const nestedValue = pick(obj[nestedKey], key[nestedKey]);
      result[nestedKey] = nestedValue;
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

export function mapToObject<K extends string, V>(map: Map<K, V>): { [P in K]: V } {
  const result: { [P in K]: V } = {};
  for (const [key, value] of map.entries()) {
    result[key] = value;
  }
  return result;
}

// make function that takes Map and return array of values
export function mapValuesToArray<K, V>(map: Map<K, V>): V[] {
  const result: V[] = [];
  for (const value of map.values()) {
    result.push(value);
  }
  return result;
}

