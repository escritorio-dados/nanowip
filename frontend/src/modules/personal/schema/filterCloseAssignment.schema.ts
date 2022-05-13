import * as yup from 'yup';

export type IFilterCloseAssignmentSchema = {
  task: string;
  local: string;
  min_end: Date | null;
  max_end: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterCloseAssignmentSchema = yup.object();
