import { isEqual } from 'date-fns';

export function isDifferentDate(leftDate?: Date, rightDate?: Date, leftNotNull?: boolean) {
  if (!leftDate && leftNotNull) {
    return false;
  }

  if ((!leftDate && rightDate) || (!rightDate && leftDate)) {
    return true;
  }

  if (leftDate && rightDate) {
    return !isEqual(leftDate, rightDate);
  }

  return false;
}
