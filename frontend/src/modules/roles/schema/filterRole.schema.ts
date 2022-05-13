import * as yup from 'yup';

export type IFilterRoleSchema = {
  name: string;
  permission: {
    permission: string;
    translation: string;
  } | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterRoleSchema = yup.object();
