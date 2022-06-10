import { ICommonApi } from '#shared/types/ICommonApi';

export type IMeasure = ICommonApi & { name: string };

export type IMeasureFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IMeasureInput = { name: string };

export const limitedMeasuresLength = 100;
