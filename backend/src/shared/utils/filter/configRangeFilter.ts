import { IFilterValue, IFilterValueAlias } from './configFiltersRepository';

type IConfigRangeFilter = { min_value: Date | number; max_value: Date | number };

export function configRangeFilter({ min_value, max_value }: IConfigRangeFilter) {
  let dateFilter: IFilterValue;

  if (!!min_value && !!max_value) {
    if (min_value === max_value) {
      dateFilter = ['equal', min_value];
    } else {
      dateFilter = ['between', min_value, max_value];
    }

    dateFilter = ['between', min_value, max_value];
  } else if (min_value) {
    dateFilter = ['gte', min_value];
  } else if (max_value) {
    dateFilter = ['lte', max_value];
  }

  return dateFilter;
}

export function configRangeFilterAlias({ min_value, max_value }: IConfigRangeFilter) {
  const dateFilter: Omit<IFilterValueAlias, 'alias' | 'field'> = {} as Omit<
    IFilterValueAlias,
    'alias' | 'field'
  >;

  if (!!min_value && !!max_value) {
    if (min_value === max_value) {
      dateFilter.operation = 'equal';
      dateFilter.values = [min_value];
    } else {
      dateFilter.operation = 'between';
      dateFilter.values = [min_value, max_value];
    }
  } else if (min_value) {
    dateFilter.operation = 'gte';
    dateFilter.values = [min_value];
  } else if (max_value) {
    dateFilter.operation = 'lte';
    dateFilter.values = [max_value];
  }

  return dateFilter;
}
