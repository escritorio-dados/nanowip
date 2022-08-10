import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';

import { IObjectiveCategoryType, ObjectiveCategoryTypes } from '../entities/ObjectiveCategory';

export class ObjectiveCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  operational_objective_id: string;

  @IsIn(Object.values(ObjectiveCategoryTypes))
  @IsNotEmpty()
  type: IObjectiveCategoryType;
}
