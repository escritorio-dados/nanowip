import { ICommonApi } from '../shared/ICommonApi';
import { ICost } from './ICost';

export type IService = ICommonApi & {
  name: string;
  costs: ICost[];
};

export type IServiceFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IServiceInput = { name: string };

export const limitedServicesLength = 100;
