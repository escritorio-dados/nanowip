import { ICommonApi } from '#shared/types/ICommonApi';

export type IProjectType = ICommonApi & { name: string };

export type IProjectTypeFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IProjectTypeInput = { name: string };

export const limitedProjectTypesLength = 100;
