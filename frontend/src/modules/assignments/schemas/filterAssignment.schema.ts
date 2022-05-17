import * as yup from 'yup';

type IOption = { id: string; name: string };

export type IFilterAssignmentSchema = {
  task: string;
  local: string;
  collaborator: IOption | null;
  status: string | null;
  in_progress: boolean;
  min_start: Date | null;
  max_start: Date | null;
  min_end: Date | null;
  max_end: Date | null;
  min_deadline: Date | null;
  max_deadline: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterAssignmentSchema = yup.object();
