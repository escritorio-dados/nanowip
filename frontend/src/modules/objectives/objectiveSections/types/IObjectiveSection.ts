import { IAllowedKeysCategories, ICommonApi } from '#shared/types/ICommonApi';

import { IDeliverable } from '#modules/objectives/deliverables/types/IDeliverable';
import { IObjectiveCategory } from '#modules/objectives/objectiveCategories/types/IObjectiveCategory';

export type IObjectiveSection = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  position: number;
  objectiveCategory: IObjectiveCategory;
  deliverables: IDeliverable[];
};

export type ICreateObjectiveSectionInput = { name: string; objective_category_id: string };

export type IUpdateObjectiveSectionInput = { name: string };

export type INewPosition = { id: string; position: number };

export type ISortObjectiveSectionInput = {
  objective_category_id: string;
  newPositions: INewPosition[];
};
