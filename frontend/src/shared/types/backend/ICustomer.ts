import { IProject } from './IProject';
import { ICommonApi } from './shared/ICommonApi';

export type ICustomer = ICommonApi & {
  name: string;
  projects: IProject[];
};

export type ICustomerFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ICustomerInput = { name: string };

export const limitedCustomersLength = 100;
