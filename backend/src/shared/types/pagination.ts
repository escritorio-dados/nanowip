import { ICustomFilters, IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { ISortValue } from '@shared/utils/filter/configSortRepository';

export type IResponsePagination<T> = {
  pagination: {
    total_results: number;
    total_pages: number;
    page: number;
  };
  data: T;
};

export type IFindPagination = {
  organization_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

export const paginationSizeSmall = 3;

export const paginationSize = 10;

export const paginationSizeLarge = 25;

export type IFindLimited = {
  organization_id: string;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};
