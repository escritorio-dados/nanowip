import { isAfter } from 'date-fns';

import { StatusDate } from '@shared/enums/statusDate.enum';

type ObjectWithDates = {
  [key: string]: any;
  availableDate?: Date;
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
};

export const statusDateFilterFields = ['late', 'created', 'available', 'started', 'ended'];

export type IStatusDateFilter = 'late' | 'created' | 'available' | 'started' | 'ended';

export function getStatusDate<T extends ObjectWithDates>(object: T) {
  const { availableDate, deadline, endDate, startDate } = object;

  let late = false;

  if (deadline) {
    if (endDate && isAfter(endDate, deadline)) {
      late = true;
    } else if (isAfter(new Date(), deadline) && !endDate) {
      late = true;
    }
  }

  let status = StatusDate.created;

  if (endDate) {
    status = StatusDate.ended;
  } else if (startDate) {
    status = StatusDate.started;
  } else if (availableDate) {
    status = StatusDate.available;
  }

  return {
    status,
    late,
  };
}
