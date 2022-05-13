import * as yup from 'yup';

export type IFilterMeasureSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterMeasureSchema = yup.object();
