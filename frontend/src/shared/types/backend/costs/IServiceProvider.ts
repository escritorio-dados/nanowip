import { ICommonApi } from '../shared/ICommonApi';
import { ICost } from './ICost';

export type IServiceProvider = ICommonApi & {
  name: string;
  costs: ICost[];
};

export type IServiceProviderFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IServiceProviderInput = { name: string };

export const limitedServiceProvidersLength = 100;
