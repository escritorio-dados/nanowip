import { IAllowedKeysCategories, ICommonApi } from '#shared/types/ICommonApi';

import { IValueChain } from '#modules/valueChains/types/IValueChain';

export type IDeliverableTag = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  deadline?: Date;
  progress?: number;
  goal?: number;
  description?: string;
  objective_category_id: string;
  progressValueChains?: number;
  goalValueChains?: number;
  valueChains?: IValueChain[];
  tags?: string[];
};

export type ICreateDeliverableTagInput = {
  name: string;
  objective_category_id: string;
  description?: string;
  progress?: number;
  goal?: number;
  deadline?: Date;
  value_chains_id?: string[];
};

export type IUpdateDeliverableTagInput = {
  name: string;
  deadline?: Date;
  description?: string;
  progress?: number;
  goal?: number;
  value_chains_id?: string[];
};
