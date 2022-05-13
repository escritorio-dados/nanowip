import { isBefore, isEqual, max, min } from 'date-fns';

import {
  DatesChangesController,
  IObjectWithDates,
  IOldNewDatesFormat,
} from './DatesChangeController';

type IVerifyChangesDates = {
  currentDate: Date | null;
  newDate: Date | null;
  datesController: DatesChangesController;
  subEntities?: IObjectWithDates[];
};

type IVerifyChangesDatesInit = IVerifyChangesDates & {
  oldDate?: Date | null;
  type: 'changeAvailable' | 'changeStart';
};

type IVerifyChangesDatesEnd = IVerifyChangesDates & {
  deleted?: boolean;
};

export type INeedRecalculate = IOldNewDatesFormat & {
  currentObject: IObjectWithDates;
  deleted?: boolean;
};

export function recalculateAvailableDate(subEntities: IObjectWithDates[]): Date | null {
  // Pegando somente as datas de disponibilidade, e removendo da lista as datas vazias
  const dates = subEntities.map(({ availableDate }) => availableDate).filter(date => !!date);

  // Se alguma ja está disponivel vai renornar a menor data entre eles
  if (dates.length >= 1) {
    return min(dates);
  }

  // Se nenhuma inicou retorna null
  return null;
}

export function recalculateStartDate(subEntities: IObjectWithDates[]): Date | null {
  // Pegando somente as datas de inicio, e removendo da lista as datas vazias
  const dates = subEntities.map(({ startDate }) => startDate).filter(date => !!date);

  // Se alguma iniciou vai renornar a menor data entre eles
  if (dates.length >= 1) {
    return min(dates);
  }

  // Se nenhuma inicou retorna null
  return null;
}

export function recalculateEndDate(subEntities: IObjectWithDates[]): Date | null {
  // Pegando as datas de fim e removendo as vazias
  const dates = subEntities.map(({ endDate }) => endDate).filter(date => !!date);

  // Se todas finalizaram pega a maior
  if (dates.length > 0 && dates.length === subEntities.length) {
    return max(dates);
  }

  // Se tem alguma que não finalizou retorna null
  return null;
}

export function verifyNeedRecalculate({
  available,
  end,
  start,
  currentObject,
  deleted,
}: INeedRecalculate) {
  const recalculateStart =
    start &&
    !start.new &&
    currentObject.startDate &&
    start.old &&
    isEqual(start.old, currentObject.startDate);

  const recalculateAvailable =
    available &&
    !available.new &&
    currentObject.availableDate &&
    available.old &&
    isEqual(available.old, currentObject.availableDate);

  const recalculateEnd = deleted || (end && end.new && !isEqual(currentObject.endDate, end.new));

  return recalculateEnd || recalculateAvailable || recalculateStart;
}

export async function verifyChangesInitDates({
  currentDate,
  datesController,
  newDate,
  oldDate,
  subEntities,
  type,
}: IVerifyChangesDatesInit): Promise<Date> {
  // Data Atual é nula e nova data não é nula
  if (!currentDate && newDate) {
    datesController[type] = true;

    return newDate;
  }

  // Existe uma data atual e nova, e a nova é menor que a atual
  if (newDate && currentDate && isBefore(newDate, currentDate)) {
    datesController[type] = true;

    return newDate;
  }

  // UPDATE -> Existia uma data anteriormente e a nova é null, e a data antiga é igual a atual
  if (!newDate && currentDate && oldDate && isEqual(oldDate, currentDate)) {
    datesController[type] = true;

    if (type === 'changeAvailable') {
      return recalculateAvailableDate(subEntities);
    }

    return recalculateStartDate(subEntities);
  }

  return currentDate;
}

export async function verifyChangesEndDates({
  currentDate,
  datesController,
  newDate,
  deleted,
  subEntities,
}: IVerifyChangesDatesEnd) {
  // Se foi excluido algo
  if (deleted) {
    datesController.changeEnd = true;

    return recalculateEndDate(subEntities);
  }

  // Nova data de término é null
  if (!newDate && currentDate) {
    datesController.changeEnd = true;

    return null;
  }

  // Possui uma nova data e ela é diferente da data atual
  if (newDate && !isEqual(currentDate, newDate)) {
    datesController.changeEnd = true;

    return recalculateEndDate(subEntities);
  }

  return currentDate;
}
