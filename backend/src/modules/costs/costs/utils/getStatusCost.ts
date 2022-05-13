import { differenceInDays, isBefore } from 'date-fns';

import { Cost } from '../entities/Cost';
import { StatusCost } from '../enums/status.cost.enum';

export const statusCostFilterFields = ['late', 'created', 'almostLate', 'issued', 'paid'];

export type IStatusCostFilter = 'late' | 'created' | 'almostLate' | 'issued' | 'paid';

export function getStatusCost(cost: Cost) {
  const { dueDate, issueDate, paymentDate } = cost;

  if (paymentDate && isBefore(paymentDate, new Date())) {
    return StatusCost.paid;
  }

  if (dueDate && !paymentDate) {
    if (isBefore(dueDate, new Date())) {
      return StatusCost.late;
    }

    const daysToLate = differenceInDays(dueDate, new Date());

    if (daysToLate <= 5) {
      return StatusCost.almostLate;
    }
  }

  if (issueDate) {
    return StatusCost.issued;
  }

  return StatusCost.created;
}
