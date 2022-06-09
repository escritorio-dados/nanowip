import { IKeepStatesContextData } from '#shared/hooks/keepStates';

import { IPaginationConfig } from './pagination';
import { removeEmptyFields } from './removeEmptyFields';

type IGetApiConfig<T> = {
  searchParams: URLSearchParams;
  defaultPaginationConfig: IPaginationConfig<T>;
  keepState: IKeepStatesContextData;
  stateKey: string;
};

export function getApiConfig<T>({
  searchParams,
  defaultPaginationConfig,
  keepState: { getState, updateState },
  stateKey,
}: IGetApiConfig<T>): IPaginationConfig<T> {
  const pageParam = searchParams.get('page');
  const sortByParam = searchParams.get('sort_by');
  const orderByParam = searchParams.get('order_by');

  const filtersParam = searchParams.get('filters');

  let filters = getState<T>({
    category: 'filters',
    key: stateKey,
    defaultValue: defaultPaginationConfig.filters,
  });

  if (filtersParam) {
    filters = JSON.parse(filtersParam);

    updateState({
      category: 'filters',
      key: stateKey,
      value: filters,
      localStorage: true,
    });
  }

  const sort_by =
    sortByParam ||
    getState<string>({
      category: 'sort_by',
      key: stateKey,
      defaultValue: defaultPaginationConfig.sort_by,
    });

  const order_by =
    orderByParam ||
    getState<string>({
      category: 'order_by',
      key: stateKey,
      defaultValue: defaultPaginationConfig.order_by,
    });

  return {
    page: Number(pageParam) || defaultPaginationConfig.page,
    sort_by,
    order_by,
    filters,
  };
}

type IUpdateSearchParams = { apiConfig: IPaginationConfig<any>; searchParams: URLSearchParams };

export function updateSearchParams({ apiConfig, searchParams }: IUpdateSearchParams) {
  const { page, order_by, sort_by, filters } = apiConfig;

  const filtersString = JSON.stringify(removeEmptyFields(filters, true));

  searchParams.set('page', String(page));
  searchParams.set('order_by', order_by);
  searchParams.set('sort_by', sort_by);

  if (filtersString !== '{}') {
    searchParams.set('filters', filtersString);
  } else {
    searchParams.delete('filters');
  }

  return searchParams;
}
