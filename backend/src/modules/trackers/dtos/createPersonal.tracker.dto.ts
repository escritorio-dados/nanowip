import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class CreatePersonalTrackerDto {
  @IsDate()
  @Transform(transformDatesApi)
  start: Date;

  @IsOptional()
  @IsDate()
  @Transform(transformDatesApi)
  end?: Date;

  @IsOptional()
  @IsUUID()
  assignment_id?: string;

  @ValidateIf(data => !data.assignment_id)
  @IsNotEmpty()
  reason?: string;
}
