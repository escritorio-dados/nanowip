import { ICommonApi } from '#shared/types/ICommonApi';

import { ICollaborator } from '#modules/collaborators/collaborators/types/ICollaborator';

export type ICollaboratorStatus = ICommonApi & {
  salary: number;
  monthHours: number;
  date: Date;
  collaborator: ICollaborator;
  collaborator_id: string;
};

export type ICollaboratorStatusFilters = {
  collaborator: { id: string; name: string } | null;
  min_salary: string;
  max_salary: string;
  min_month_hours: string;
  max_month_hours: string;
  min_date: Date | null;
  max_date: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ICollaboratorStatusInput = {
  salary: number;
  monthHours: number;
  date: Date;
  collaborator_id: string;
};
