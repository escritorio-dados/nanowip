import { ICommonApi } from '../shared/ICommonApi';

export type IOperationalObjective = ICommonApi & {
  name: string;
  deadline?: Date;
};

export type IOperationalObjectiveFilters = {
  name: string;
  min_deadline: Date | null;
  max_deadline: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IOperationalObjectiveInput = { name: string; deadline?: Date };

export const limitedOperationalObjectivesLength = 100;
