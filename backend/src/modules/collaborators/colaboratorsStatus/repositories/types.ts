import { Collaborator } from '@modules/collaborators/collaborators/entities/Collaborator';

export type ICreateCollaboratorStatusRepository = {
  salary: number;
  monthHours: number;
  date: Date;
  collaborator: Collaborator;
  organization_id: string;
};
