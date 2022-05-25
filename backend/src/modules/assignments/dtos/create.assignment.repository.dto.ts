import { Collaborator } from '@modules/collaborators/entities/Collaborator';
import { Task } from '@modules/tasks/tasks/entities/Task';

import { StatusAssignment } from '../enums/status.assignment.enum';

export type ICreateAssignmentRepositoryDto = {
  collaborator: Collaborator;
  task: Task;
  status: StatusAssignment;
  timeLimit?: number;
  organization_id: string;
};
