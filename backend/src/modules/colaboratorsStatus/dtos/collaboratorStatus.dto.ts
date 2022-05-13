import { Transform, Type } from 'class-transformer';
import { IsUUID, Min, IsNumber, IsDate } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class CollaboratorStatusDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salary: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthHours: number;

  @IsDate()
  @Transform(transformDatesApi)
  date: Date;

  @IsUUID()
  collaborator_id: string;
}
