import { OperationalObjective } from '@modules/objectives/operacionalObjectives/entities/OperationalObjective';

export type ICreateObjectiveCategoryRepository = {
  name: string;
  organization_id: string;
  position: number;
  operationalObjective: OperationalObjective;
};
