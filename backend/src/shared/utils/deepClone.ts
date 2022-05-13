export function deepClone<T extends Record<string, any>>(object: T): T {
  const copy = {};

  for (const key of Object.keys(object)) {
    if (object[key] instanceof Date) {
      copy[key] = object[key];
    } else if (Array.isArray(object[key])) {
      copy[key] = [...object[key]];
    } else if (typeof object[key] === 'object') {
      copy[key] = { ...deepClone(object[key]) };
    } else {
      copy[key] = object[key];
    }
  }

  return copy as T;
}
