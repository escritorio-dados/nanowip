import { User } from '@modules/users/users/entities/User';

export type ICreateCollaboratorRepository = {
  name: string;
  jobTitle: string;
  type: 'Interno' | 'Externo';
  user: User;
  organization_id: string;
};
