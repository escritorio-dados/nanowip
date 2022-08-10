import { IAllowedKeysCategories, ICommonApi } from '#shared/types/ICommonApi';

import { IOperationalObjective } from '#modules/objectives/operationalObjectives/types/IOperationalObjective';

export type IObjectiveCategoryType = 'manual' | 'tags';
export const ObjectiveCategoryTypes = { manual: 'manual', tags: 'tags' };

export type IObjectiveCategory = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  position: number;
  type: IObjectiveCategoryType;
  operationalObjective: IOperationalObjective;
};

export type ICreateObjectiveCategoryInput = {
  name: string;
  operational_objective_id: string;
  type: string;
};

export type IUpdateObjectiveCategoryInput = {
  name: string;
  operational_objective_id: string;
};

export type INewPosition = { id: string; position: number };

export type ISortObjectiveCategoryInput = {
  operational_objective_id: string;
  newPositions: INewPosition[];
};
