import { ICommonApi } from './shared/ICommonApi';

export const DEFAULT_MEASURE_ID = '4c0a91e1-99d2-454e-93a8-debb8f946231';

export type IMeasure = ICommonApi & { name: string };

export type IMeasureFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IMeasureInput = { name: string };

export const limitedMeasuresLength = 100;
