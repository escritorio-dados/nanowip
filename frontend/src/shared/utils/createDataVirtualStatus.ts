import { isAfter } from 'date-fns';

interface IDateStatus {
  deadline?: Date;
  endDate?: Date;
  startDate?: Date;
  availableDate?: Date;
}

export function createDataVirtualStatus({
  availableDate,
  deadline,
  endDate,
  startDate,
}: IDateStatus): string {
  if (deadline) {
    if (endDate && isAfter(endDate, deadline)) {
      return 'Finalizado Atrasado';
    }

    if (isAfter(new Date(), deadline) && !endDate) {
      return 'Atrasado';
    }
  }

  if (endDate) {
    return 'Finalizado';
  }

  if (startDate) {
    return 'Em Andamento';
  }

  if (availableDate) {
    return 'Disponivel';
  }

  return 'Criado';
}
