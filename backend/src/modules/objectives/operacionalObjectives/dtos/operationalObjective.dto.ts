import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class OperationalObjectiveDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  integrated_objective_id: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  deadline?: Date;
}
