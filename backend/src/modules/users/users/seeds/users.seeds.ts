import { hashSync } from 'bcrypt';

import { DEFAULT_ORGANIZATION_IDS } from '@modules/organizations/seeds/organizations.seeds';

import { User } from '../entities/User';
import { PermissionsUser } from '../enums/permissionsUser.enum';

export const DEFAULT_USER_ID = 'efb22058-90cf-41cc-8cd0-f63e62ad496f';

export const usersSeeds: Partial<User>[] = [
  {
    id: DEFAULT_USER_ID,
    name: 'Administrador',
    email: 'admin@gmail.com',
    password: hashSync('admin', 10),
    permissions: [PermissionsUser.admin],
    organization_id: DEFAULT_ORGANIZATION_IDS.SYSTEM,
  },
];
