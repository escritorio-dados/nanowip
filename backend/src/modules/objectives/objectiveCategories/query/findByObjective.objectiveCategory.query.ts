import { IsUUID } from 'class-validator';

export class FindByObjectiveObjectiveCategoryQuery {
  @IsUUID()
  operational_objective_id: string;
}
