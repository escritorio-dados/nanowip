import * as yup from 'yup';

export type IFilterOrganizationSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterOrganizationSchema = yup.object();
