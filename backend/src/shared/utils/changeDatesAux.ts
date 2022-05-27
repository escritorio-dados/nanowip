import { max, min } from 'date-fns';

export type IObjectWithDates = {
  [key: string]: any;
  id?: string;
  availableDate?: Date;
  startDate?: Date;
  endDate?: Date;
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
