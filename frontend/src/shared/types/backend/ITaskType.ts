import { ICommonApi } from './shared/ICommonApi';

export type ITaskType = ICommonApi & { name: string };

export type ITaskTypeFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ITaskTypeInput = { name: string };

export const limitedTaskTypesLength = 100;
