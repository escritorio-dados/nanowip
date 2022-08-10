import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class UpdateDeliverableTagDto {
  @IsNotEmpty()
  name: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  deadline?: Date;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @Min(0)
  progress?: number;

  @IsOptional()
  @IsPositive()
  goal?: number;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  @IsArray()
  value_chains_id?: string[];
}
