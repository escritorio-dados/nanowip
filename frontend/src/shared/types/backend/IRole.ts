import { ICommonApi } from './shared/ICommonApi';

export type IRole = ICommonApi & {
  name: string;
  permissions: string[];
};

export type IRoleFilters = {
  name: string;
  permission: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IRoleInput = { name: string; permissions: string[] };
