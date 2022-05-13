import { TransformFnParams } from 'class-transformer';

export function transformDatesApi(value: TransformFnParams) {
  if (!value || !value.value) {
    return null;
  }

  return new Date(value.value);
}
