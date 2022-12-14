import { ICommonApi } from '#shared/types/ICommonApi';
import { IStatusDate } from '#shared/types/IStatusDate';

import { ICollaborator } from '#modules/collaborators/collaborators/types/ICollaborator';
import { ITask } from '#modules/tasks/tasks/types/ITask';
import { ITracker } from '#modules/trackers/types/ITracker';

export type IAssignment = ICommonApi & {
  status: string;
  inProgress: string;
  collaborator: ICollaborator;
  task: ITask;
  task_id: string;
  collaborator_id: string;
  startDate: Date;
  endDate: Date;
  trackers: ITracker[];
  trackerInProgress?: ITracker;
  deadline?: Date | null;
  duration?: number;
  timeLimit?: number;
  statusDate: IStatusDate;
};

export type ICreateAssignmentInput = {
  status: string;
  task_id: string;
  collaborator_id: string;
  timeLimit?: number;
};
export type IUpdateAssignmentInput = { status: string; timeLimit?: number };

export type IChangeStatusAssignmentInput = { status: string };

export type IAssignmentFilters = {
  task: string;
  local: string;
  collaborator: { id: string; name: string } | null;
  status_date: { value: string; label: string } | null;
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

export type ICloseAssignmentsPersonalFilters = {
  task: string;
  local: string;
  min_end: Date | null;
  max_end: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const limitedAssignmentsLength = 100;

export const StatusAssignment = {
  open: 'Aberto', // A tarefa ainda está por fazer
  close: 'Fechado', // Colaborador marcou como finalizada
};
