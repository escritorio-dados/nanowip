import { isBefore } from 'date-fns';

import { AppError } from '@shared/errors/AppError';
import { dateErrors } from '@shared/errors/common.errors';

type IStartEndDates = { end?: Date; start?: Date };

type IFullDates = IStartEndDates & { available?: Date };

export function validateStartEndDate({ start, end }: IStartEndDates) {
  // Data de inicio deve ser menor que a data atual
  if (start && isBefore(new Date(), start)) {
    throw new AppError(dateErrors.futureStart);
  }

  // Data final deve ser menor que a data atual
  if (end && isBefore(new Date(), end)) {
    throw new AppError(dateErrors.futureEnd);
  }

  if (end) {
    // Deve existir uma data inicial quando existir uma data final
    if (!start) {
      throw new AppError(dateErrors.endWithoutStart);
    }

    // Data final deve ser inferior a data inicial
    if (isBefore(end, start)) {
      throw new AppError(dateErrors.startAfterEnd);
    }
  }
}

export function validadeDates({ available, end, start }: IFullDates) {
  // Data de inicio só pode existir se existir data de disponibilidade
  if (start && !available) {
    throw new AppError(dateErrors.startWithoutAvailable);
  }

  // Data de disponibilidade Futura
  if (available && isBefore(new Date(), available)) {
    throw new AppError(dateErrors.futureAvailable);
  }

  // Data de disponibilidade deve ser inferior a data de inicio
  if (available && start && isBefore(start, available)) {
    throw new AppError(dateErrors.availableAfterStart);
  }

  // Validações da data de inicio e final
  validateStartEndDate({ end, start });
}
