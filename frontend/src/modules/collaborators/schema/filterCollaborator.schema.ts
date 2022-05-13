import * as yup from 'yup';

export type IFilterCollaboratorSchema = {
  name: string;
  jobTitle: string;
  type: string | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterCollaboratorSchema = yup.object();
