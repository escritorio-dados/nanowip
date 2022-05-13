import * as yup from 'yup';

export type IFilterServiceProviderSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterServiceProviderSchema = yup.object();
