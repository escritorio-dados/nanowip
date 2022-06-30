import { ICommonApi } from '#shared/types/ICommonApi';

import { IOperationalObjective } from '#modules/objectives/operationalObjectives/types/IOperationalObjective';

export type IIntegratedObjective = ICommonApi & {
  name: string;
  operationalObjectives: IOperationalObjective[];
};

export type IIntegratedObjectiveFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IIntegratedObjectiveInput = { name: string };

export const limitedIntegratedObjectivesLength = 100;
