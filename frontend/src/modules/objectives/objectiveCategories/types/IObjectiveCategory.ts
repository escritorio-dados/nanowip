import { IAllowedKeysCategories, ICommonApi } from '#shared/types/ICommonApi';

import { IOperationalObjective } from '#modules/objectives/operationalObjectives/types/IOperationalObjective';

export type IObjectiveCategory = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  position: number;
  operationalObjective: IOperationalObjective;
};

export type IObjectiveCategoryInput = { name: string; operational_objective_id: string };

export type INewPosition = { id: string; position: number };

export type ISortObjectiveCategoryInput = {
  operational_objective_id: string;
  newPositions: INewPosition[];
};
