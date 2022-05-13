import { Assignment } from '@modules/assignments/entities/Assignment';
import { Collaborator } from '@modules/collaborators/entities/Collaborator';

export type ICreateTrackerRepositoryDto = {
  collaborator: Collaborator;
  start: Date;
  organization_id: string;
  end?: Date;
  assignment?: Assignment;
  reason?: string;
};
