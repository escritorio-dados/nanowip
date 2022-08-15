import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class MilestoneDto {
  @IsNotEmpty()
  name: string;

  @IsDate()
  @Transform(transformDatesApi)
  date: Date;

  @IsOptional()
  @IsNotEmpty()
  description?: string;
}
