import { isAfter } from 'date-fns';
import { SelectQueryBuilder } from 'typeorm';

export type ISortConfig = {
  [key: string]: ISortValue;
};

export type ISortValue = {
  field: string;
  alias: string[];
  subField?: string[];
};

type IConfigSortRepository<T> = {
  query: SelectQueryBuilder<T>;
  sortConfig: ISortValue;
  order: 'ASC' | 'DESC';
};

export function configSortRepository<T>({
  query,
  sortConfig: { alias, field },
  order,
}: IConfigSortRepository<T>) {
  const [alias1, ...otherAlias] = alias;

  query.orderBy(`${alias1}${field}`, order, 'NULLS LAST');

  otherAlias.forEach(a => {
    query.addOrderBy(`${a}${field}`, order, 'NULLS LAST');
  });
}

type ISubFieldsValues = Date | string | number;

export function sortSubFunction(a: ISubFieldsValues, b: ISubFieldsValues, order: number) {
  if (!a) {
    return 1 * order;
  }

  if (!b) {
    return -1 * order;
  }

  if (a instanceof Date && b instanceof Date) {
    return isAfter(a, b) ? 1 * order : -1 * order;
  }

  return a >= b ? 1 * order : -1 * order;
}
