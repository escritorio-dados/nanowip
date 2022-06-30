import { ObjectiveSection } from '@modules/objectives/objectiveSections/entities/ObjectiveSection';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

export type ICreateDeliverableRepository = {
  name: string;
  organization_id: string;
  position: number;
  objectiveSection: ObjectiveSection;
  valueChains?: ValueChain[];
  deadline?: Date;
  description?: string;
  progress?: number;
  goal?: number;
};
