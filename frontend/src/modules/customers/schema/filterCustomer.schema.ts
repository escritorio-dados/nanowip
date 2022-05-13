import * as yup from 'yup';

export type IFilterCustomerSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterCustomerSchema = yup.object();
