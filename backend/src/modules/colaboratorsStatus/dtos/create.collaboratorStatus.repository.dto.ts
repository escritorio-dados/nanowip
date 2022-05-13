import { Collaborator } from '@modules/collaborators/entities/Collaborator';

export type ICreateCollaboratorStatusRepositoryDto = {
  salary: number;
  monthHours: number;
  date: Date;
  collaborator: Collaborator;
  organization_id: string;
};
