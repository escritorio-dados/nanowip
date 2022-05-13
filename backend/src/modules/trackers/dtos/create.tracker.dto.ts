import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class CreateTrackerDto {
  @IsUUID()
  collaborator_id: string;

  @IsDate()
  @Transform(transformDatesApi)
  start: Date;

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
