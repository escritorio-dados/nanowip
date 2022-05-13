import * as yup from 'yup';

export type IFilterUserSchema = {
  name: string;
  email: string;
  permission: {
    permission: string;
    translation: string;
  } | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterUserSchema = yup.object();
