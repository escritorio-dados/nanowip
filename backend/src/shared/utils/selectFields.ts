export function selectFields<T>(object: T, fields: string[]) {
  const returnObject: T = {} as T;

  fields.forEach(field => {
    returnObject[field] = object[field];
  });

  return returnObject;
}
