import { OperationalObjective } from '@modules/objectives/operacionalObjectives/entities/OperationalObjective';

import { IObjectiveCategoryType } from '../entities/ObjectiveCategory';

export type ICreateObjectiveCategoryRepository = {
  name: string;
  organization_id: string;
  position: number;
  type: IObjectiveCategoryType;
  operationalObjective: OperationalObjective;
};
