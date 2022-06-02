import { Assignment } from '@modules/assignments/entities/Assignment';
import { Collaborator } from '@modules/collaborators/collaborators/entities/Collaborator';

export type ICreateTrackerRepository = {
  collaborator: Collaborator;
  start: Date;
  organization_id: string;
  end?: Date;
  assignment?: Assignment;
  reason?: string;
};
