import * as yup from 'yup';

export type IFilterDocumentTypeSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterDocumentTypeSchema = yup.object();
