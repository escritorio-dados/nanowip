import { IAssignment } from './IAssignment';
import { ICollaboratorStatus } from './ICollaboratorStatus';
import { IUser } from './IUser';
import { ICommonApi } from './shared/ICommonApi';

export type ICollaborator = ICommonApi & {
  name: string;
  jobTitle: string;
  type: string;
  user?: IUser;
  collaboratorStatus: ICollaboratorStatus[];
  assignments: IAssignment[];
};

export type ICollaboratorFilters = {
  name: string;
  jobTitle: string;
  type: string | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ICollaboratorInput = { name: string; jobTitle: string; type: string; user_id?: string };

export const limitedCollaboratorsLength = 100;
