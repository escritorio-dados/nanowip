import { ICommonApi } from '#shared/types/backend/shared/ICommonApi';

import { ITaskTrail } from '#modules/trails/taskTrails/types/ITaskTrail';
import { IValueChainInput } from '#modules/valueChains/types/IValueChain';

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
