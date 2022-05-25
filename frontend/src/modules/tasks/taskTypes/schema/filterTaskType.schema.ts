import * as yup from 'yup';

export type IFilterTaskTypeSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterTaskTypeSchema = yup.object();
