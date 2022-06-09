import { ICommonApi } from '#shared/types/backend/shared/ICommonApi';

import { IAssignment } from '#modules/assignments/types/IAssignment';
import { ICollaboratorStatus } from '#modules/collaborators/collaboratorsStatus/types/ICollaboratorStatus';
import { IUser } from '#modules/users/users/types/IUser';

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
