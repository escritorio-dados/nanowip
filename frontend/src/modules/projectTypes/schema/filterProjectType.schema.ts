import * as yup from 'yup';

export type IFilterProjectTypeSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterProjectTypeSchema = yup.object();
