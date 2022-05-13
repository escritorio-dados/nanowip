import * as yup from 'yup';

export type IFilterTrailSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterTrailSchema = yup.object();
