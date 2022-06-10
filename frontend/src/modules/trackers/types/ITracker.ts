import { ICommonApi } from '#shared/types/ICommonApi';

import { IAssignment } from '#modules/assignments/types/IAssignment';
import { ICollaborator } from '#modules/collaborators/collaborators/types/ICollaborator';

export type ITracker = ICommonApi & {
  start: Date;
  end: Date;
  reason: string;
  collaborator: ICollaborator;
  collaborator_id: string;
  assignment?: IAssignment;
  assignment_id?: string;
  duration?: number;
};

export type ICreateTrackerInput = {
  start: Date;
  end: Date;
  collaborator_id: string;
  reason?: string;
  assignment_id?: string;
};

export type ICreateTrackerInputPersonal = Omit<ICreateTrackerInput, 'collaborator_id'>;

export type IStartTrackerInput = { assignment_id?: string; reason?: string };

export type IUpdateTrackerInput = {
  start: Date;
  end: Date;
  reason?: string;
  assignment_id?: string;
};

export type ITrackerFilters = {
  task: string;
  local: string;
  reason: string;
  collaborator: { id: string; name: string } | null;
  type: string | null;
  status: string | null;
  in_progress: boolean;
  min_start: Date | null;
  max_start: Date | null;
  min_end: Date | null;
  max_end: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ITrackerFiltersPersonal = Omit<ITrackerFilters, 'collaborator'>;
