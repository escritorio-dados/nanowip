import { User } from '@modules/users/entities/User';

export type ICreateCollaboratorRepositoryDto = {
  name: string;
  jobTitle: string;
  type: 'Interno' | 'Externo';
  user: User;
  organization_id: string;
};
