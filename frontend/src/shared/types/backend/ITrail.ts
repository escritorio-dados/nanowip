import { ITaskTrail } from './ITaskTrail';
import { IValueChainInput } from './IValueChain';
import { ICommonApi } from './shared/ICommonApi';

export type ITrail = ICommonApi & {
  name: string;
  tasks: ITaskTrail[];
};

export type ITrailFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ITrailInput = { name: string };

export type IInstantiateTrailInput = IValueChainInput & { trail_id: string };

export const limitedTrailsLength = 100;
