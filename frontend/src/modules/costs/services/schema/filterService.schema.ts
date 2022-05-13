import * as yup from 'yup';

export type IFilterServiceSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterServiceSchema = yup.object();
