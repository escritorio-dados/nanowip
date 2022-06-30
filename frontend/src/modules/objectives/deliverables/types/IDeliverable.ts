import { IAllowedKeysCategories, ICommonApi } from '#shared/types/ICommonApi';

import { IValueChain } from '#modules/valueChains/types/IValueChain';

export type IDeliverable = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  position: number;
  deadline?: Date;
  progress?: number;
  goal?: number;
  description?: string;
  objective_section_id: string;
  progressValueChains?: number;
  goalValueChains?: number;
  valueChains?: IValueChain[];
};

export type ICreateDeliverableInput = {
  name: string;
  objective_section_id: string;
  description?: string;
  progress?: number;
  goal?: number;
  deadline?: Date;
  value_chains_id?: string[];
};

export type IUpdateDeliverableInput = {
  name: string;
  deadline?: Date;
  description?: string;
  progress?: number;
  goal?: number;
  value_chains_id?: string[];
};

export type IChangeSectionDeliverableInput = { new_section_id: string };

export type INewPosition = { id: string; position: number };

export type ISortDeliverableInput = {
  objective_section_id: string;
  newPositions: INewPosition[];
};
