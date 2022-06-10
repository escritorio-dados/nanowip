import { ICommonApi } from '#shared/types/ICommonApi';

export type IRole = ICommonApi & {
  name: string;
  permissions: string[];
};

export type IRoleFilters = {
  name: string;
  permission: {
    permission: string;
    translation: string;
  } | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IRoleInput = { name: string; permissions: string[] };

export const limitedRolesLength = 100;
