import * as yup from 'yup';

export type IFilterTrackerPersonalSchema = {
  task: string;
  local: string;
  reason: string;
  status: string | null;
  in_progress: boolean;
  type: string | null;
  min_start: Date | null;
  max_start: Date | null;
  min_end: Date | null;
  max_end: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterTrackerPersonalSchema = yup.object();
