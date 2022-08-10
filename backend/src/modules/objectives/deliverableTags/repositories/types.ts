import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

export type ICreateDeliverableTagRepository = {
  name: string;
  organization_id: string;
  position: number;
  objectiveCategory: ObjectiveCategory;
  valueChains?: ValueChain[];
  deadline?: Date;
  description?: string;
  progress?: number;
  goal?: number;
};
