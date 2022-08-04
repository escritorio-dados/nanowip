import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID, IsOptional, IsDate, IsUrl, IsArray } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class UpdateNoDepedencyTaskDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsOptional()
  link: string;

  @IsUUID()
  task_type_id: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  deadline?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  endDate?: Date | null;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  availableDate?: Date;

  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsArray()
  tags?: string[] = [];
}
