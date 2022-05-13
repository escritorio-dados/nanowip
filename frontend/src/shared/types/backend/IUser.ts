import { ICollaborator } from './ICollaborator';
import { ICommonApi } from './shared/ICommonApi';

export const DEFAULT_USER_ID = 'efb22058-90cf-41cc-8cd0-f63e62ad496f';

export type IUser = ICommonApi & {
  name: string;
  email: string;
  permissions: string[];
  collaborator?: ICollaborator;
  organization_id: string;
};

export type IUserFilters = {
  name: string;
  email: string;
  permission: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ICreateUser = { name: string; email: string; password: string; permissions: string[] };

export type IUpdateUser = { name: string; email: string; password?: string; permissions: string[] };

export type IChangePasswordInput = { oldPassword: string; newPassword: string };

export const limitedUsersLength = 100;
