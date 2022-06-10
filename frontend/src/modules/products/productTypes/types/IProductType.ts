import { ICommonApi } from '#shared/types/ICommonApi';

export type IProductType = ICommonApi & { name: string };

export type IProductTypeFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IProductTypeInput = { name: string };

export const limitedProductTypesLength = 100;
