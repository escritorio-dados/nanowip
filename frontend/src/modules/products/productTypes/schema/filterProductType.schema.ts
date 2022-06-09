import * as yup from 'yup';

export type IFilterProductTypeSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterProductTypeSchema = yup.object();
