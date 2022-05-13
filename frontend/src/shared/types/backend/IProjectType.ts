import { ICommonApi } from './shared/ICommonApi';

export const DEFAULT_PROJECT_TYPE_ID = 'f66b2b12-78a0-482b-bad4-fcf61a98c886';

export type IProjectType = ICommonApi & { name: string };

export type IProjectTypeFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IProjectTypeInput = { name: string };

export const limitedProjectTypesLength = 100;
