export function selectFields<T>(object: T, fields: string[]) {
  const returnObject: T = {} as T;

  fields.forEach(field => {
    returnObject[field] = object[field];
  });

  return returnObject;
}

export function getFieldsQuery(entities: string[], fields: string[]) {
  const fieldsText: string[] = [];

  entities.forEach(entity => {
    fields.forEach(field => {
      fieldsText.push(`${entity}.${field}`);
    });
  });

  return fieldsText;
}
