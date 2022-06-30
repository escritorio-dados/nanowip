import { IsNotEmpty, IsUUID } from 'class-validator';

export class ObjectiveCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  operational_objective_id: string;
}
