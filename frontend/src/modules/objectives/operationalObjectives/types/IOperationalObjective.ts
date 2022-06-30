import { IAllowedKeysCategories, ICommonApi } from '#shared/types/ICommonApi';

import { IIntegratedObjective } from '#modules/objectives/integratedObjectives/types/IIntegratedObjective';

export type IOperationalObjective = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  deadline?: Date;
  integratedObjective: IIntegratedObjective;
};

export type IOperationalObjectiveFilters = {
  name: string;
  integratedObjective: { id: string; name: string } | null;
  min_deadline: Date | null;
  max_deadline: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IOperationalObjectiveInput = {
  name: string;
  deadline?: Date;
  integrated_objective_id: string;
};

export const limitedOperationalObjectivesLength = 100;
